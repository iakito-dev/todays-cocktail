class AddInstructionsJaToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktails, :instructions_ja, :text
  end
end
