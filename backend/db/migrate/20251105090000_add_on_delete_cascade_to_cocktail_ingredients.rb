# frozen_string_literal: true

class AddOnDeleteCascadeToCocktailIngredients < ActiveRecord::Migration[8.0]
  def up
    remove_foreign_key :cocktail_ingredients, :cocktails
    add_foreign_key :cocktail_ingredients, :cocktails, on_delete: :cascade
  end

  def down
    remove_foreign_key :cocktail_ingredients, :cocktails
    add_foreign_key :cocktail_ingredients, :cocktails
  end
end
