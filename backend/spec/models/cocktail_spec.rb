require 'rails_helper'

RSpec.describe Cocktail, type: :model do
  describe 'associations' do
    it { should have_many(:cocktail_ingredients).dependent(:destroy) }
    it { should have_many(:ingredients).through(:cocktail_ingredients) }
    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:favorited_by_users).through(:favorites).source(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
  end

  describe 'enums' do
    it { should define_enum_for(:base).with_values(%i[gin rum whisky vodka tequila beer wine]) }
    it { should define_enum_for(:strength).with_values(%i[light medium strong]) }
    it { should define_enum_for(:technique).with_values(%i[build stir shake]).with_prefix }
  end

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

  describe 'creating a complete cocktail with ingredients' do
    it 'can create a cocktail with multiple ingredients' do
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
