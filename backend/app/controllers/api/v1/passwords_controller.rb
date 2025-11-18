# frozen_string_literal: true

module Api
  module V1
    class PasswordsController < Devise::PasswordsController
      respond_to :json

      # POST /api/v1/password/forgot
      def create
        email = resource_params[:email]
        if email.blank?
          return render json: {
            status: { code: 422, message: "メールアドレスを入力してください。" },
            errors: [ "メールアドレスを入力してください。" ]
          }, status: :unprocessable_entity
        end

        # メールアドレスが存在していてもいなくても同じ応答（セキュリティのため）
        if (user = User.find_by(email: email))
          user.send_reset_password_instructions
        end

        render json: {
          status: { code: 200, message: "パスワード再設定メールを送信しました。" }
        }, status: :ok
      end

      # PUT /api/v1/password/reset
      def update
        user = User.reset_password_by_token(reset_password_params)

        if user.errors.empty?
          render json: {
            status: { code: 200, message: "パスワードを再設定しました。" }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "パスワードの再設定に失敗しました。" },
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def resource_params
        params.require(:user).permit(:email)
      end

      def reset_password_params
        params.require(:user).permit(:password, :password_confirmation, :reset_password_token)
      end
    end
  end
end
