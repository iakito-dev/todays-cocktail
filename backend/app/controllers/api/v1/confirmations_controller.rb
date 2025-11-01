# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < Devise::ConfirmationsController
      respond_to :json

      # GET /api/v1/confirmation?confirmation_token=xxx
      def show
        self.resource = resource_class.confirm_by_token(params[:confirmation_token])

        # エラーがあっても、既に確認済みの場合は成功として扱う
        if resource.errors.empty? || (resource.persisted? && resource.confirmed?)
          # 確認後、自動的にログイン（JWTトークンを発行）
          sign_in(resource)

          # respond_withを使ってトークンを含むレスポンスを返す
          respond_with resource, location: after_sign_in_path_for(resource)
        else
          render json: {
            status: { code: 422, message: "確認トークンが無効です。" },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def respond_with(resource, _opts = {})
        render json: {
          status: { code: 200, message: "メールアドレスが確認されました。" },
          data: {
            user: {
              id: resource.id,
              email: resource.email,
              name: resource.name,
              confirmed: resource.confirmed?,
              admin: resource.admin
            }
          }
        }, status: :ok
      end

      # POST /api/v1/confirmation
      def create
        self.resource = resource_class.send_confirmation_instructions(resource_params)

        if successfully_sent?(resource)
          render json: {
            status: { code: 200, message: "確認メールを再送信しました。" }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "確認メールの送信に失敗しました。" },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def resource_params
        params.require(:user).permit(:email)
      end
    end
  end
end
