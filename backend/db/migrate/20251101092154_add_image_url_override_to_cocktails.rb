class AddImageUrlOverrideToCocktails < ActiveRecord::Migration[8.0]
  def change
    add_column :cocktails, :image_url_override, :string
  end
end
