# frozen_string_literal: true

module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      private

      def respond_with(resource, _opts = {})
        render json: {
          status: { code: 200, message: "ログインに成功しました。" },
          data: {
            user: {
              id: resource.id,
              email: resource.email
            }
          }
        }, status: :ok
      end

      def respond_to_on_destroy
        # ログアウト前にユーザーが認証されていたか確認
        # (ログアウト処理後はcurrent_userがnilになるため、ログアウト成功と判定)
        render json: {
          status: { code: 200, message: "ログアウトしました。" }
        }, status: :ok
      end
    end
  end
end
