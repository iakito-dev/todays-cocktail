# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/users/me
      def me
        render json: {
          status: { code: 200, message: "ユーザー情報を取得しました。" },
          data: {
            user: {
              id: current_user.id,
              email: current_user.email,
              name: current_user.name
            }
          }
        }, status: :ok
      end
    end
  end
end
