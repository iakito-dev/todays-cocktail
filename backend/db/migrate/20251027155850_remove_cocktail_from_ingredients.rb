class RemoveCocktailFromIngredients < ActiveRecord::Migration[8.0]
  def change
    remove_reference :ingredients, :cocktail, null: false, foreign_key: true
    remove_column :ingredients, :amount, :string
  end
end
