# frozen_string_literal: true
class Cocktail < ApplicationRecord
  has_many :cocktail_ingredients, dependent: :destroy
  has_many :ingredients, through: :cocktail_ingredients

  enum :base, {
    gin: 0,
    rum: 1,
    whisky: 2,
    vodka: 3,
    tequila: 4,
    beer: 5,
    wine: 6
  }

  enum :strength, {
    light: 0,
    medium: 1,
    strong: 2
  }

  enum :technique, {
    build: 0,
    stir: 1,
    shake: 2
  }, prefix: true

  validates :name, presence: true

  # 材料を順序つきで取得
  def ordered_ingredients
    cocktail_ingredients.includes(:ingredient).ordered
  end
end
