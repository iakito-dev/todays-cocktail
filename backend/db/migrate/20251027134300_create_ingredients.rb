class CreateIngredients < ActiveRecord::Migration[8.0]
  def change
    create_table :ingredients do |t|
      t.string :name
      t.string :amount
      t.references :cocktail, null: false, foreign_key: true

      t.timestamps
    end
  end
end
