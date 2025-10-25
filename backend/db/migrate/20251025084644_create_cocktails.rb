class CreateCocktails < ActiveRecord::Migration[6.1]
  def change
    create_table :cocktails do |t|
      t.string :name, index: true # カクテル名
      t.integer :base, default: 0, null: false # ベース材料
      t.integer :strength, default: 0, null: false # 強さ
      t.integer :technique, default: 0, null: false # 技法
      t.string :image_url # 画像URL
      t.text :instructions # レシピ
      t.timestamps
    end
  end
end
