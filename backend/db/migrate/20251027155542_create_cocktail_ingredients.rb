class CreateCocktailIngredients < ActiveRecord::Migration[8.0]
  def change
    create_table :cocktail_ingredients do |t|
      t.references :cocktail, null: false, foreign_key: true
      t.references :ingredient, null: false, foreign_key: true
      t.string :amount_text
      t.integer :position

      t.timestamps
    end
  end
end
