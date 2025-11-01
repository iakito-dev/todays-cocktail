# frozen_string_literal: true

module Api
  module V1
    class ConfirmationsController < Devise::ConfirmationsController
      respond_to :json

      # GET /api/v1/confirmation?confirmation_token=xxx
      def show
        self.resource = resource_class.confirm_by_token(params[:confirmation_token])

        if resource.errors.empty?
          render json: {
            status: { code: 200, message: "メールアドレスが確認されました。" },
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
            status: { code: 422, message: "確認トークンが無効です。" },
            errors: resource.errors.full_messages
          }, status: :unprocessable_entity
        end
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
