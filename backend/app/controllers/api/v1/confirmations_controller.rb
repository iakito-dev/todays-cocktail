# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < ApplicationController
      respond_to :json

      # GET /api/v1/confirmation?confirmation_token=xxx
      def show
        user = User.confirm_by_token(params[:confirmation_token])

        # エラーがあっても、既に確認済みの場合は成功として扱う
        if user.errors.empty? || (user.persisted? && user.confirmed?)
          # 確認後、自動的にログイン(JWTトークンを発行)
          sign_in(user)

          render json: {
            status: { code: 200, message: "メールアドレスが確認されました。" },
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                confirmed: user.confirmed?,
                admin: user.admin
              }
            }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "確認トークンが無効です。" },
            errors: user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/confirmation
      def create
        user = User.send_confirmation_instructions(resource_params)

        if user.errors.empty?
          render json: {
            status: { code: 200, message: "確認メールを再送信しました。" }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "確認メールの送信に失敗しました。" },
            errors: user.errors.full_messages
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
