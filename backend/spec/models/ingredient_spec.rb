require 'rails_helper'

RSpec.describe Ingredient, type: :model do
  describe 'associations' do
    it { should have_many(:cocktail_ingredients).dependent(:destroy) }
    it { should have_many(:cocktails).through(:cocktail_ingredients) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }

    it 'validates uniqueness of name' do
      create(:ingredient, name: 'TestIngredient')
      should validate_uniqueness_of(:name)
    end
  end

  describe 'creating ingredients' do
    it 'can create multiple cocktails with the same ingredient' do
      ingredient = create(:ingredient)
      cocktail1 = create(:cocktail)
      cocktail2 = create(:cocktail)

      create(:cocktail_ingredient, cocktail: cocktail1, ingredient: ingredient, amount_text: '45ml', position: 1)
      create(:cocktail_ingredient, cocktail: cocktail2, ingredient: ingredient, amount_text: '30ml', position: 1)

      expect(ingredient.cocktails.count).to eq(2)
    end
  end
end
