require 'rails_helper'

RSpec.describe Cocktail, type: :model do
  # カクテルモデルは多くの関連・enum・ヘルパーを持つため、各セクションの目的をコメントで揃える

  # Section: Associations — 関連が崩れると全 API が破綻するため網羅的に確認
  describe 'associations' do
    it { should have_many(:cocktail_ingredients).dependent(:destroy) }
    it { should have_many(:ingredients).through(:cocktail_ingredients) }
    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:favorited_by_users).through(:favorites).source(:user) }
  end

  # Section: Validations — 名前必須ルールは importer/管理画面で最も頼りにする
  describe 'validations' do
    it { should validate_presence_of(:name) }

    describe 'image_url_override' do
      it '有効なHTTP URLを許可する' do
        cocktail = build(:cocktail, image_url_override: 'http://example.com/image.jpg')
        expect(cocktail).to be_valid
      end

      it '有効なHTTPS URLを許可する' do
        cocktail = build(:cocktail, image_url_override: 'https://example.com/image.jpg')
        expect(cocktail).to be_valid
      end

      it '空文字列を許可する' do
        cocktail = build(:cocktail, image_url_override: '')
        expect(cocktail).to be_valid
      end

      it 'nilを許可する' do
        cocktail = build(:cocktail, image_url_override: nil)
        expect(cocktail).to be_valid
      end

      it 'javascript:プロトコルを拒否する' do
        cocktail = build(:cocktail, image_url_override: 'javascript:alert("XSS")')
        expect(cocktail).not_to be_valid
        expect(cocktail.errors[:image_url_override]).to include('はHTTPまたはHTTPSプロトコルである必要があります')
      end

      it 'data:プロトコルを拒否する' do
        cocktail = build(:cocktail, image_url_override: 'data:text/html,<script>alert("XSS")</script>')
        expect(cocktail).not_to be_valid
        expect(cocktail.errors[:image_url_override]).to include('はHTTPまたはHTTPSプロトコルである必要があります')
      end

      it '無効なURL形式を拒否する' do
        cocktail = build(:cocktail, image_url_override: 'not a valid url')
        expect(cocktail).not_to be_valid
        expect(cocktail.errors[:image_url_override]).to include('は有効なURL形式である必要があります')
      end

      it 'ホストがないURLを拒否する' do
        cocktail = build(:cocktail, image_url_override: 'https://')
        expect(cocktail).not_to be_valid
        expect(cocktail.errors[:image_url_override]).to include('は有効なURL形式である必要があります')
      end
    end
  end

  # Section: Enums — base/strength/technique の値変更はフィルタや翻訳に直結
  describe 'enums' do
    it { should define_enum_for(:base).with_values(%i[gin rum whisky vodka tequila beer wine]) }
    it { should define_enum_for(:strength).with_values(%i[light medium strong]) }
    it { should define_enum_for(:technique).with_values(%i[build stir shake]).with_prefix }
  end

  # Section: ordered_ingredients — 表示順序・分量をまとめて返すヘルパーの整合性を担保
  describe '#ordered_ingredients' do
    let(:cocktail) { create(:cocktail) }
    let!(:ingredient1) { create(:ingredient, name: 'テスト材料A') }
    let!(:ingredient2) { create(:ingredient, name: 'テスト材料B') }
    let!(:ingredient3) { create(:ingredient, name: 'テスト材料C') }

    before do
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient2, position: 2, amount_text: '適量')
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient3, position: 3, amount_text: '1/8個')
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient1, position: 1, amount_text: '45ml')
    end

    it 'returns ingredients in the correct order' do
      ordered = cocktail.ordered_ingredients
      expect(ordered.map { |ci| ci.ingredient.name }).to eq([ 'テスト材料A', 'テスト材料B', 'テスト材料C' ])
    end

    it 'includes amount_text information' do
      ordered = cocktail.ordered_ingredients
      expect(ordered.first.amount_text).to eq('45ml')
    end
  end

  # Section: Creating cocktail with ingredients — 手作業で関連を組んでも破綻しないか
  describe 'creating a complete cocktail with ingredients' do
    it 'can create a cocktail with multiple ingredients' do
      # FactoryBot のトレイトを使わず完全に自前で組み立て、依存する関連が正しく保存されるかを確認
      cocktail = create(:cocktail, name: 'ジントニック', base: :gin, strength: :light, technique: :build)
      gin = create(:ingredient, name: 'テストジン')
      tonic = create(:ingredient, name: 'テストトニック')
      lime = create(:ingredient, name: 'テストライム')

      create(:cocktail_ingredient, cocktail: cocktail, ingredient: gin, amount_text: '45ml', position: 1)
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: tonic, amount_text: '適量', position: 2)
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: lime, amount_text: '1/8個', position: 3)

      cocktail.reload
      expect(cocktail.ingredients.count).to eq(3)
      expect(cocktail.ordered_ingredients.first.ingredient.name).to eq('テストジン')
      expect(cocktail.ordered_ingredients.first.amount_text).to eq('45ml')
    end
  end

  # Section: display_image_url — 手動上書きの画像 URL をそのまま返すだけのヘルパー
  describe '#display_image_url' do
    it 'returns the override URL when present' do
      cocktail = create(:cocktail, image_url_override: 'https://example.com/custom.jpg')
      expect(cocktail.display_image_url).to eq('https://example.com/custom.jpg')
    end

    it 'returns nil when no override is set' do
      cocktail = create(:cocktail, image_url_override: nil)
      expect(cocktail.display_image_url).to be_nil
    end
  end

  # Section: Favorites — 多対多の関連とヘルパーが期待どおり動くか
  describe 'お気に入り機能' do
    let(:cocktail) { create(:cocktail) }
    let(:user) { create(:user) }

    describe '#favorited_by?' do
      context 'ユーザーがお気に入りに追加している場合' do
        before { create(:favorite, user: user, cocktail: cocktail) }

        it 'trueを返す' do
          expect(cocktail.favorited_by?(user)).to be true
        end
      end

      context 'ユーザーがお気に入りに追加していない場合' do
        it 'falseを返す' do
          expect(cocktail.favorited_by?(user)).to be false
        end
      end

      context 'ユーザーがnilの場合' do
        it 'falseを返す' do
          expect(cocktail.favorited_by?(nil)).to be false
        end
      end
    end

    it 'カクテルを削除するとお気に入りも削除される' do
      create(:favorite, user: user, cocktail: cocktail)
      expect {
        cocktail.destroy
      }.to change(Favorite, :count).by(-1)
    end

    it '複数のユーザーにお気に入り登録される' do
      user1 = create(:user)
      user2 = create(:user)
      user3 = create(:user)

      create(:favorite, user: user1, cocktail: cocktail)
      create(:favorite, user: user2, cocktail: cocktail)
      create(:favorite, user: user3, cocktail: cocktail)

      expect(cocktail.favorited_by_users.count).to eq(3)
      expect(cocktail.favorited_by_users).to include(user1, user2, user3)
    end
  end
end
