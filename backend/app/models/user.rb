class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist

  # お気に入り機能の関連付け
  has_many :favorites, dependent: :destroy
  has_many :favorite_cocktails, through: :favorites, source: :cocktail
end
