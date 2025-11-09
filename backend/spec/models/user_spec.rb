# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  # Section コメントで認証モデルの責務を一望できるようにする

  # Section: Associations — お気に入り機能との紐付け
  describe 'associations' do
    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:favorite_cocktails).through(:favorites).source(:cocktail) }
  end

  # Section: Validations — Devise 依存の基本ルール
  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:password) }
  end

  # Section: Devise modules — 必要なモジュールが有効かをリストアップ
  describe 'devise modules' do
    it 'includes database_authenticatable module' do
      expect(User.devise_modules).to include(:database_authenticatable)
    end

    it 'includes registerable module' do
      expect(User.devise_modules).to include(:registerable)
    end

    it 'includes validatable module' do
      expect(User.devise_modules).to include(:validatable)
    end

    it 'includes confirmable module' do
      expect(User.devise_modules).to include(:confirmable)
    end

    it 'includes jwt_authenticatable module' do
      expect(User.devise_modules).to include(:jwt_authenticatable)
    end
  end

  # Section: Confirmable — メール認証フローを担保
  describe 'confirmable機能' do
    let(:user) { create(:user) }

    it '新規作成時は未確認状態' do
      new_user = create(:user)
      expect(new_user.confirmed?).to be false
    end

    it '確認トークンが生成される' do
      new_user = create(:user)
      expect(new_user.confirmation_token).to be_present
    end

    it 'confirmメソッドで確認済みにできる' do
      user.confirm
      expect(user.confirmed?).to be true
    end

    it '確認メールが送信される' do
      expect { create(:user) }.to change { ActionMailer::Base.deliveries.count }.by(1)
    end
  end

  # Section: Admin flag — 権限管理が初期値 false かつトグル可能か
  describe 'admin機能' do
    it 'デフォルトでadminはfalse' do
      user = create(:user)
      expect(user.admin).to be false
    end

    it 'adminフラグをtrueに設定できる' do
      admin = create(:user, :admin)
      expect(admin.admin).to be true
    end
  end

  # Section: Favorites — user 側から見た多対多
  describe 'お気に入り機能' do
    let(:user) { create(:user) }
    let(:cocktail) { create(:cocktail) }

    it 'カクテルをお気に入りに追加できる' do
      expect {
        user.favorites.create(cocktail: cocktail)
      }.to change(user.favorites, :count).by(1)
    end

    it 'お気に入りのカクテル一覧を取得できる' do
      cocktail1 = create(:cocktail)
      cocktail2 = create(:cocktail)
      user.favorites.create(cocktail: cocktail1)
      user.favorites.create(cocktail: cocktail2)

      expect(user.favorite_cocktails).to include(cocktail1, cocktail2)
      expect(user.favorite_cocktails.count).to eq(2)
    end

    it 'ユーザーを削除するとお気に入りも削除される' do
      user.favorites.create(cocktail: cocktail)
      expect {
        user.destroy
      }.to change(Favorite, :count).by(-1)
    end
  end
end
