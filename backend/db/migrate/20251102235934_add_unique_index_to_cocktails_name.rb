class AddUniqueIndexToCocktailsName < ActiveRecord::Migration[8.0]
  def change
    # 既存のnameインデックスを削除（もしあれば）
    remove_index :cocktails, :name, if_exists: true

    # ユニーク制約付きインデックスを追加
    add_index :cocktails, :name, unique: true
  end
end
