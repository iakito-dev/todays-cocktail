# frozen_string_literal: true

module Api
  module V1
    class SessionsController < Devise::SessionsController
      respond_to :json
      skip_before_action :verify_signed_out_user, only: :destroy

      # POST /api/v1/login
      def create
        # メールアドレスでユーザーを検索
        user = User.find_by(email: params[:user][:email])

        # ユーザーが存在しない、またはパスワードが一致しない
        if user.nil? || !user.valid_password?(params[:user][:password])
          render json: {
            status: { code: 401, message: "メールアドレスまたはパスワードが正しくありません。" },
            errors: [ "認証に失敗しました" ]
          }, status: :unauthorized
          return
        end

        # メール確認が必要な場合はログインを拒否
        unless user.confirmed?
          render json: {
            status: { code: 401, message: "メールアドレスの確認が完了していません。確認メールをご確認ください。" },
            errors: [ "メールアドレスが未確認です" ]
          }, status: :unauthorized
          return
        end

        # ログイン成功
        sign_in(:user, user)
        self.resource = user
        respond_with resource, location: after_sign_in_path_for(resource)
      rescue StandardError => e
        Rails.logger.error "Login error: #{e.message}"
        Rails.logger.error e.backtrace.join("\n")
        render json: {
          status: { code: 500, message: "ログイン処理中にエラーが発生しました。" },
          errors: [ e.message ]
        }, status: :internal_server_error
      end

      # DELETE /api/v1/logout
      def destroy
        token = request.headers["Authorization"]&.split(" ")&.last

        if token
          begin
            decoded_token = JWT.decode(
              token,
              Rails.application.credentials.devise_jwt_secret_key || ENV["DEVISE_JWT_SECRET_KEY"],
              true,
              { algorithm: "HS256" }
            )

            jti = decoded_token[0]["jti"]
            exp = decoded_token[0]["exp"]

            # トークンをdenylistに追加
            JwtDenylist.create!(jti: jti, exp: Time.at(exp))
          rescue JWT::DecodeError, JWT::ExpiredSignature
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
              email: resource.email,
              name: resource.name,
              admin: resource.admin
            }
          }
        }, status: :ok
      end

      def respond_to_on_destroy
        render json: {
          status: { code: 200, message: "ログアウトしました。" }
        }, status: :ok
      end
    end
  end
end
