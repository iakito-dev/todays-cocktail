class EnablePgTrgmAndAddSearchIndexes < ActiveRecord::Migration[8.0]
  def up
    # Enable extension (no-op if already enabled)
    enable_extension "pg_trgm" unless extension_enabled?("pg_trgm")

    # GIN indexes using trigram ops to accelerate ILIKE searches
    add_index :cocktails, :name, using: :gin, opclass: :gin_trgm_ops, name: "index_cocktails_on_name_trgm", if_not_exists: true
    add_index :cocktails, :name_ja, using: :gin, opclass: :gin_trgm_ops, name: "index_cocktails_on_name_ja_trgm", if_not_exists: true
    add_index :cocktails, :instructions, using: :gin, opclass: :gin_trgm_ops, name: "index_cocktails_on_instructions_trgm", if_not_exists: true
    add_index :cocktails, :instructions_ja, using: :gin, opclass: :gin_trgm_ops, name: "index_cocktails_on_instructions_ja_trgm", if_not_exists: true

    add_index :ingredients, :name, using: :gin, opclass: :gin_trgm_ops, name: "index_ingredients_on_name_trgm", if_not_exists: true
    add_index :ingredients, :name_ja, using: :gin, opclass: :gin_trgm_ops, name: "index_ingredients_on_name_ja_trgm", if_not_exists: true
  end

  def down
    remove_index :cocktails, name: "index_cocktails_on_name_trgm", if_exists: true
    remove_index :cocktails, name: "index_cocktails_on_name_ja_trgm", if_exists: true
    remove_index :cocktails, name: "index_cocktails_on_instructions_trgm", if_exists: true
    remove_index :cocktails, name: "index_cocktails_on_instructions_ja_trgm", if_exists: true
    remove_index :ingredients, name: "index_ingredients_on_name_trgm", if_exists: true
    remove_index :ingredients, name: "index_ingredients_on_name_ja_trgm", if_exists: true

    disable_extension "pg_trgm" if extension_enabled?("pg_trgm")
  end
end
