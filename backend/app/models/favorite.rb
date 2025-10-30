class Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :cocktail

  # バリデーション：同じユーザーが同じカクテルを複数回お気に入りできないようにする
  validates :user_id, uniqueness: { scope: :cocktail_id, message: "は既にこのカクテルをお気に入りに追加しています" }
end
