class AddGlassToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktails, :glass, :string
  end
end
