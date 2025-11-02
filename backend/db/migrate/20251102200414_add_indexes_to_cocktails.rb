class AddIndexesToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_index :cocktails, :name, if_not_exists: true
    add_index :cocktails, :name_ja, if_not_exists: true
    add_index :cocktails, :base, if_not_exists: true
  end
end
