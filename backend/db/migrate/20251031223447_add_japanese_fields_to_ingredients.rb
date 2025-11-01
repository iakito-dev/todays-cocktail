class AddJapaneseFieldsToIngredients < ActiveRecord::Migration[8.0]
  def change
    add_column :ingredients, :name_ja, :string
  end
end
