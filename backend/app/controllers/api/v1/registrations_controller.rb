# frozen_string_literal: true

module Api
  module V1
    class RegistrationsController < Devise::RegistrationsController
      respond_to :json

      # POST /api/v1/signup
      # 新規登録処理
      def create
        build_resource(sign_up_params)

        if resource.save
          # メール確認が必要な場合は自動ログインしない（開発環境でも同様）
          render_resource(resource, "確認メールを送信しました。メールを確認してアカウントを有効化してください。")
        else
          render_resource(resource, "アカウントの作成に失敗しました。")
        end
      end

      private

      # パラメータの取得方法をオーバーライド
      def sign_up_params
        params.require(:user).permit(:email, :password, :password_confirmation, :name)
      end

      def account_update_params
        params.require(:user).permit(:email, :password, :password_confirmation, :current_password, :name)
      end

      # リソースのレンダリング
      def render_resource(resource, message = nil)
        if resource.persisted?
          render json: {
            status: { code: 200, message: message || "アカウントを作成しました。" },
            data: {
              user: {
                id: resource.id,
                email: resource.email,
                name: resource.name,
                confirmed: resource.confirmed?
              }
            }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: message || "アカウントの作成に失敗しました。" },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
