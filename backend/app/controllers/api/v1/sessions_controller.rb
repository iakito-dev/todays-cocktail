# frozen_string_literal: true

module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json

      # DELETE /api/v1/logout
      def destroy
        token = request.headers['Authorization']&.split(' ')&.last

        if token
          begin
            decoded_token = JWT.decode(
              token,
              Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'],
              true,
              { algorithm: 'HS256' }
            )

            jti = decoded_token[0]['jti']
            exp = decoded_token[0]['exp']

            # トークンをdenylistに追加
            JwtDenylist.create!(jti: jti, exp: Time.at(exp))
          rescue JWT::DecodeError, JWT::ExpiredSignature => e
            # トークンが無効でもログアウト成功とする
          end
        end

        render json: {
          status: { code: 200, message: "ログアウトしました。" }
        }, status: :ok
      end

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
    end
  end
end
