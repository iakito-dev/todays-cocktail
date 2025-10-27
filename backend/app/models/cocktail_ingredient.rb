class CocktailIngredient < ApplicationRecord
  belongs_to :cocktail
  belongs_to :ingredient

  validates :amount_text, presence: true
  validates :cocktail_id, uniqueness: { scope: :ingredient_id }

  scope :ordered, -> { order(:position, :id) }
end
