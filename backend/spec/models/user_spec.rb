# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'associations' do
    it { should have_many(:favorites).dependent(:destroy) }
    it { should have_many(:favorite_cocktails).through(:favorites).source(:cocktail) }
  end

  describe 'validations' do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
    it { should validate_presence_of(:password) }
  end

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

    it 'includes jwt_authenticatable module' do
      expect(User.devise_modules).to include(:jwt_authenticatable)
    end
  end

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
