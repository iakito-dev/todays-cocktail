class RemoveImageUrlFromCocktails < ActiveRecord::Migration[8.0]
  def change
    remove_column :cocktails, :image_url, :string
  end
end
