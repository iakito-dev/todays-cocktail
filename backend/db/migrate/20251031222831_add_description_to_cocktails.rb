class AddDescriptionToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktails, :description, :text
  end
end
