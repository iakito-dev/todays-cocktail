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
          sign_in(resource)
          render_resource(resource)
        else
          render_resource(resource)
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
      def render_resource(resource)
        if resource.persisted?
          render json: {
            status: { code: 200, message: "アカウントを作成しました。" },
            data: {
              user: {
                id: resource.id,
                email: resource.email,
                name: resource.name
              }
            }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "アカウントの作成に失敗しました。" },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end
    end
  end
end
