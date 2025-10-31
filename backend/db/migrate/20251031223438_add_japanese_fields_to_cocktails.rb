class AddJapaneseFieldsToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktails, :name_ja, :string
    add_column :cocktails, :glass_ja, :string
  end
end
