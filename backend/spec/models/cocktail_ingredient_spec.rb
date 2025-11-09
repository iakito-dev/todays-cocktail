require 'rails_helper'

RSpec.describe CocktailIngredient, type: :model do
  describe 'associations' do
    it { should belong_to(:cocktail) }
    it { should belong_to(:ingredient) }
  end

  describe 'validations' do
    it { should validate_presence_of(:amount_text) }

    it 'validates uniqueness of cocktail_id scoped to ingredient_id' do
      cocktail = create(:cocktail)
      ingredient = create(:ingredient)
      create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient)

      should validate_uniqueness_of(:cocktail_id).scoped_to(:ingredient_id)
    end
  end

  describe 'scopes' do
    it 'orders by position and id' do
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
