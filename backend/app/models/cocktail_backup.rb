class Cocktail < ApplicationRecord
  # enum定義
  enum base: {
    gin: 0,
    rum: 1,
    whisky: 2,
    vodka: 3,
    tequila: 4,
    beer: 5,
    wine: 6
  }

  enum strength: {
    light: 0,
    medium: 1,
    strong: 2
  }

  enum technique: {
    build: 0,
    stir: 1,
    shake: 2
  }

  validates :name, presence: true
end
