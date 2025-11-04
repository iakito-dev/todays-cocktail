# frozen_string_literal: true

module Api
  module V1
    class FavoritesController < ApplicationController
      before_action :authenticate_user! # ログインしているユーザーのみアクセス可能

      # GET /api/v1/favorites
      # ログインユーザーのお気に入りカクテル一覧を取得
      def index
        favorites = current_user.favorites.includes(cocktail: :ingredients).order(created_at: :desc)

        render json: {
          status: { code: 200, message: "お気に入り一覧を取得しました。" },
          data: favorites.map do |favorite|
            {
              id: favorite.id,
              cocktail: cocktail_json(favorite.cocktail),
              created_at: favorite.created_at
            }
          end
        }, status: :ok
      end

      # POST /api/v1/favorites
      # お気に入りに追加
      def create
        cocktail = Cocktail.find(params[:cocktail_id])
        favorite = current_user.favorites.build(cocktail: cocktail)

        if favorite.save
          render json: {
            status: { code: 201, message: "お気に入りに追加しました。" },
            data: {
              id: favorite.id,
              cocktail: cocktail_json(cocktail)
            }
          }, status: :created
        else
          render json: {
            status: { code: 422, message: "お気に入りの追加に失敗しました。" },
            errors: favorite.errors.full_messages
          }, status: :unprocessable_entity
        end
      rescue ActiveRecord::RecordNotFound
        render json: {
          status: { code: 404, message: "カクテルが見つかりません。" }
        }, status: :not_found
      end

      # DELETE /api/v1/favorites/:id
      # お気に入りから削除
      def destroy
        favorite = current_user.favorites.find(params[:id])
        favorite.destroy

        render json: {
          status: { code: 200, message: "お気に入りから削除しました。" }
        }, status: :ok
      rescue ActiveRecord::RecordNotFound
        render json: {
          status: { code: 404, message: "お気に入りが見つかりません。" }
        }, status: :not_found
      end

      private

      # カクテル情報をJSON形式に変換
      def cocktail_json(cocktail)
        {
          id: cocktail.id,
          name: cocktail.name,
          base: cocktail.base,
          strength: cocktail.strength,
          technique: cocktail.technique,
          image_url: cocktail.display_image_url,
          instructions: cocktail.instructions,
          is_favorited: true # お気に入り一覧では常にtrue
        }
      end
    end
  end
end
