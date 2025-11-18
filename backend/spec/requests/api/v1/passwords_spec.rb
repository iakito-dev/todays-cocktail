# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Passwords', type: :request do
  describe 'POST /api/v1/password/forgot' do
    let!(:user) { create(:user, :confirmed, email: 'reset@example.com') }

    before { ActionMailer::Base.deliveries.clear }

    it 'sends reset instructions when email exists' do
      post '/api/v1/password/forgot', params: { user: { email: user.email } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('status', 'message')).to eq('パスワード再設定メールを送信しました。')
      expect(ActionMailer::Base.deliveries.size).to eq(1)
    end

    it 'returns success even if email does not exist' do
      post '/api/v1/password/forgot', params: { user: { email: 'unknown@example.com' } }, as: :json

      expect(response).to have_http_status(:ok)
      expect(ActionMailer::Base.deliveries).to be_empty
    end

    it 'validates presence of email' do
      post '/api/v1/password/forgot', params: { user: { email: '' } }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json.dig('status', 'message')).to eq('メールアドレスを入力してください。')
    end
  end

  describe 'PUT /api/v1/password/reset' do
    let!(:user) { create(:user, :confirmed, email: 'reset2@example.com') }

    it 'resets password with valid token' do
      raw_token = user.send_reset_password_instructions

      put '/api/v1/password/reset', params: {
        user: {
          reset_password_token: raw_token,
          password: 'newpassword123',
          password_confirmation: 'newpassword123'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('status', 'message')).to eq('パスワードを再設定しました。')
      expect(user.reload.valid_password?('newpassword123')).to be(true)
    end

    it 'returns errors when token is invalid' do
      put '/api/v1/password/reset', params: {
        user: {
          reset_password_token: 'invalid',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json.dig('status', 'message')).to eq('パスワードの再設定に失敗しました。')
    end
  end
end
