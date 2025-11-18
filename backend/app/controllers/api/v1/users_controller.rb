# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!

      # GET /api/v1/users/me
      def me
        render_user_payload("ユーザー情報を取得しました。")
      end

      # PUT /api/v1/users/profile
      def update_profile
        if profile_params[:name].blank?
          return render json: {
            status: { code: 422, message: "ユーザー名を入力してください。" },
            errors: [ "ユーザー名を入力してください。" ]
          }, status: :unprocessable_entity
        end

        if current_user.update(name: profile_params[:name])
          render_user_payload("プロフィールを更新しました。")
        else
          render json: {
            status: { code: 422, message: "プロフィールの更新に失敗しました。" },
            errors: current_user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/users/password
      def update_password
        unless current_user.valid_password?(password_params[:current_password])
          return render json: {
            status: { code: 422, message: "現在のパスワードが正しくありません。" },
            errors: [ "現在のパスワードが正しくありません。" ]
          }, status: :unprocessable_entity
        end

        new_password = password_params[:password]
        if new_password.blank?
          return render json: {
            status: { code: 422, message: "新しいパスワードを入力してください。" },
            errors: [ "新しいパスワードを入力してください。" ]
          }, status: :unprocessable_entity
        end

        if current_user.update(password: new_password, password_confirmation: password_params[:password_confirmation])
          render json: {
            status: { code: 200, message: "パスワードを更新しました。" }
          }, status: :ok
        else
          render json: {
            status: { code: 422, message: "パスワードの更新に失敗しました。" },
            errors: current_user.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      private

      def profile_params
        params.require(:user).permit(:name)
      end

      def password_params
        params.require(:user).permit(:current_password, :password, :password_confirmation)
      end

      def render_user_payload(message)
        render json: {
          status: { code: 200, message: message },
          data: {
            user: {
              id: current_user.id,
              email: current_user.email,
              name: current_user.name,
              admin: current_user.admin
            }
          }
        }, status: :ok
      end
    end
  end
end
