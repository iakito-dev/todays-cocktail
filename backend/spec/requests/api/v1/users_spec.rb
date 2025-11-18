# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  def auth_headers_for(user)
    post '/api/v1/login', params: {
      user: { email: user.email, password: 'password123' }
    }, as: :json

    { 'Authorization' => response.headers['Authorization'] }
  end

  # 認証付きのマイページ取得 API が期待どおりに振る舞うかを確認する
  # 「リクエストスペック」は実際の HTTP リクエストを想定してレスポンスのJSON内容まで検証するテスト
  describe 'GET /api/v1/users/me' do
    let(:user) { create(:user, :confirmed, name: 'Taro User') }

    context 'when authenticated' do
      # 正しいトークンを付与した場合に 200 とユーザー情報が返ることを検証
      # before ブロックを使わず let でログインヘッダーを定義しているのは
      # 「このテスト内でのみログイン処理を実行し、その結果を使い回す」ため
      let(:auth_headers) { auth_headers_for(user) }

      it 'returns the current user profile' do
        get '/api/v1/users/me', headers: auth_headers

        expect(response).to have_http_status(:ok)
        # JSON.parse で Ruby のハッシュに変換してから値を取り出す
        json = JSON.parse(response.body)
        expect(json.dig('status', 'code')).to eq(200)
        expect(json.dig('status', 'message')).to eq('ユーザー情報を取得しました。')
        expect(json.dig('data', 'user', 'id')).to eq(user.id)
        expect(json.dig('data', 'user', 'email')).to eq(user.email)
        expect(json.dig('data', 'user', 'name')).to eq('Taro User')
        expect(json.dig('data', 'user', 'admin')).to be(false)
      end
    end

    context 'when not authenticated' do
      # トークンなしでアクセスしたときに 401 応答となることを確認
      # ログインを行わずにリクエストを送ることで「保護されたエンドポイント」へアクセスしている想定
      it 'returns unauthorized error' do
        get '/api/v1/users/me'

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('認証が必要です。ログインしてください。')
      end
    end
  end

  describe 'PUT /api/v1/users/profile' do
    let(:user) { create(:user, :confirmed, name: 'Old Name') }
    let(:auth_headers) { auth_headers_for(user) }

    it 'updates the display name' do
      put '/api/v1/users/profile', headers: auth_headers, params: {
        user: { name: 'New Display Name' }
      }, as: :json

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json.dig('status', 'message')).to eq('プロフィールを更新しました。')
      expect(json.dig('data', 'user', 'name')).to eq('New Display Name')
      expect(user.reload.name).to eq('New Display Name')
    end

    it 'rejects blank names' do
      put '/api/v1/users/profile', headers: auth_headers, params: {
        user: { name: '' }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json.dig('status', 'message')).to eq('ユーザー名を入力してください。')
      expect(user.reload.name).to eq('Old Name')
    end
  end

  describe 'PUT /api/v1/users/password' do
    let(:user) { create(:user, :confirmed) }
    let(:auth_headers) { auth_headers_for(user) }

    it 'updates password when current password matches' do
      put '/api/v1/users/password', headers: auth_headers, params: {
        user: {
          current_password: 'password123',
          password: 'newpassword456',
          password_confirmation: 'newpassword456'
        }
      }, as: :json

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).dig('status', 'message')).to eq('パスワードを更新しました。')
      expect(user.reload.valid_password?('newpassword456')).to be(true)
    end

    it 'rejects invalid current password' do
      put '/api/v1/users/password', headers: auth_headers, params: {
        user: {
          current_password: 'wrongpass',
          password: 'anotherpass789',
          password_confirmation: 'anotherpass789'
        }
      }, as: :json

      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json.dig('status', 'message')).to eq('現在のパスワードが正しくありません。')
      expect(user.reload.valid_password?('password123')).to be(true)
    end
  end
end
