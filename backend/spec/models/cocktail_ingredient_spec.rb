require 'rails_helper'

RSpec.describe CocktailIngredient, type: :model do
  # 中間テーブルなので Section コメントを付けて粒度を揃える

  # Section: Associations — belongs_to 2本が崩れると join が組めなくなる
  describe 'associations' do
    it { should belong_to(:cocktail) }
    it { should belong_to(:ingredient) }
  end

  # Section: Validations — amount_text 必須＋複合ユニーク制約
  describe 'validations' do
    it { should validate_presence_of(:amount_text) }

    it 'validates uniqueness of cocktail_id scoped to ingredient_id' do
      # 同じ材料を二重登録できないよう、先に1レコード作ってから should マッチャを適用
      cocktail = create(:cocktail)
      ingredient = create(:ingredient)
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient)

      should validate_uniqueness_of(:cocktail_id).scoped_to(:ingredient_id)
    end
  end

  # Section: Scopes — 並び替えロジック (position→id) が期待どおりか
  describe 'scopes' do
    it 'orders by position and id' do
      # 表示順序は position -> id なので、scope :ordered が期待どおりの順になるかを具体的なレコードで検証
      cocktail = create(:cocktail)
      ingredient1 = create(:ingredient)
      ingredient2 = create(:ingredient)

      ci2 = create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient2, position: 2)
      ci1 = create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient1, position: 1)

      ordered_results = CocktailIngredient.where(cocktail: cocktail).ordered
      expect(ordered_results.to_a).to eq([ ci1, ci2 ])
    end
  end
end
