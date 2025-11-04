class UpdateFavoritesForeignKeys < ActiveRecord::Migration[8.0]
  def up
    remove_foreign_key :favorites, :users
    remove_foreign_key :favorites, :cocktails

    add_foreign_key :favorites, :users, on_delete: :cascade
    add_foreign_key :favorites, :cocktails, on_delete: :cascade
  end

  def down
    remove_foreign_key :favorites, :users
    remove_foreign_key :favorites, :cocktails

    add_foreign_key :favorites, :users
    add_foreign_key :favorites, :cocktails
  end
end
