class CreateFavorites < ActiveRecord::Migration[8.0]
  def change
    create_table :favorites do |t|
      t.references :user, null: false, foreign_key: true
      t.references :cocktail, null: false, foreign_key: true

      t.timestamps
    end

    # 同じユーザーが同じカクテルを重複してお気に入りできないようにする
    add_index :favorites, [:user_id, :cocktail_id], unique: true
  end
end
