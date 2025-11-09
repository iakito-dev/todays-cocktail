# frozen_string_literal: true

class Cocktail < ApplicationRecord
  has_many :cocktail_ingredients, dependent: :destroy
  has_many :ingredients, through: :cocktail_ingredients

  # お気に入り機能の関連付け
  has_many :favorites, dependent: :destroy
  has_many :favorited_by_users, through: :favorites, source: :user

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

  # 特定のユーザーがこのカクテルをお気に入りしているか確認
  def favorited_by?(user)
    return false unless user
    favorites.exists?(user_id: user.id)
  end

  # 画像URLを取得（手動設定のみを利用）
  def display_image_url
    image_url_override.presence
  end
end
