class AddAmountJaToCocktailIngredients < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktail_ingredients, :amount_ja, :string
  end
end
