# frozen_string_literal: true

class StrengthenDatabaseConstraints < ActiveRecord::Migration[8.0]
  def up
    # 欠損している材料名を暫定名で補完（ユニーク制約導入の準備）
    execute <<~SQL.squish
      UPDATE ingredients
      SET name = CONCAT('ingredient-', id)
      WHERE name IS NULL OR name = ''
    SQL

    # 材料名が重複している場合は最小IDに統合
    execute <<~SQL.squish
      WITH ranked AS (
        SELECT
          id,
          name,
          MIN(id) OVER (PARTITION BY name) AS keep_id,
          ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS row_num
        FROM ingredients
      )
      UPDATE cocktail_ingredients AS ci
      SET ingredient_id = ranked.keep_id
      FROM ranked
      WHERE ci.ingredient_id = ranked.id
        AND ranked.row_num > 1
        AND ranked.keep_id <> ranked.id
    SQL

    execute <<~SQL.squish
      DELETE FROM ingredients
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) AS row_num
          FROM ingredients
        ) dup
        WHERE dup.row_num > 1
      )
    SQL

    # 分量テキストの欠損を暫定値で補完
    execute <<~SQL.squish
      UPDATE cocktail_ingredients
      SET amount_text = CONCAT('unspecified-', id)
      WHERE amount_text IS NULL OR amount_text = ''
    SQL

    # カクテルと材料の重複行を削除
    execute <<~SQL.squish
      DELETE FROM cocktail_ingredients
      WHERE id IN (
        SELECT id
        FROM (
          SELECT
            id,
            ROW_NUMBER() OVER (
              PARTITION BY cocktail_id, ingredient_id
              ORDER BY id
            ) AS row_num
          FROM cocktail_ingredients
        ) dup
        WHERE dup.row_num > 1
      )
    SQL

    change_column_null :ingredients, :name, false
    add_index :ingredients, :name, unique: true

    change_column_null :cocktail_ingredients, :amount_text, false
    add_index :cocktail_ingredients, %i[cocktail_id ingredient_id], unique: true
  end

  def down
    remove_index :cocktail_ingredients, column: %i[cocktail_id ingredient_id]
    change_column_null :cocktail_ingredients, :amount_text, true

    remove_index :ingredients, column: :name
    change_column_null :ingredients, :name, true
  end
end
