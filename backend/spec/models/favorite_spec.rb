# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Favorite, type: :model do
  # Section commentsで多対多中間テーブルの責務を明示

  # Section: Associations — user/cocktail への参照が確実に存在するか
  describe 'associations' do
    it { should belong_to(:user) }
    it { should belong_to(:cocktail) }
  end

  # Section: Validations — user×cocktail の複合ユニーク
  describe 'validations' do
    let(:user) { create(:user) }
    let(:cocktail) { create(:cocktail) }

    it 'user_idとcocktail_idの組み合わせがユニークであること' do
      create(:favorite, user: user, cocktail: cocktail)
      duplicate = build(:favorite, user: user, cocktail: cocktail)
      expect(duplicate).not_to be_valid
    end
  end

  # Section: Duplication guard — 組み合わせのバリエーションを網羅
  describe '重複防止' do
    let(:user) { create(:user) }
    let(:cocktail) { create(:cocktail) }

    it '同じユーザーが同じカクテルを複数回お気に入りに追加できない' do
      create(:favorite, user: user, cocktail: cocktail)
      duplicate_favorite = build(:favorite, user: user, cocktail: cocktail)

      expect(duplicate_favorite).not_to be_valid
      expect(duplicate_favorite.errors.full_messages.join).to include('は既にこのカクテルをお気に入りに追加しています')
    end

    it '異なるユーザーは同じカクテルをお気に入りに追加できる' do
      user1 = create(:user)
      user2 = create(:user)

      create(:favorite, user: user1, cocktail: cocktail)
      favorite2 = build(:favorite, user: user2, cocktail: cocktail)

      expect(favorite2).to be_valid
    end

    it '同じユーザーが異なるカクテルをお気に入りに追加できる' do
      cocktail1 = create(:cocktail)
      cocktail2 = create(:cocktail)

      create(:favorite, user: user, cocktail: cocktail1)
      favorite2 = build(:favorite, user: user, cocktail: cocktail2)

      expect(favorite2).to be_valid
    end
  end
end
