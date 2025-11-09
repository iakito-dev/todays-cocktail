require 'rails_helper'

RSpec.describe 'Api::V1::Sessions', type: :request do
  # Devise::SessionsController ベースの JSON API がロールごとに正しい応答を返すかを検証
  let(:confirmed_user) { create(:user, :confirmed) }
  let(:unconfirmed_user) { create(:user) }
  let(:admin_user) { create(:user, :admin) }

  describe 'POST /api/v1/login' do
    context '確認済みユーザーの場合' do
      it 'ログインに成功する' do
        post '/api/v1/login', params: {
          user: { email: confirmed_user.email, password: 'password123' }
        }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['user']['email']).to eq(confirmed_user.email)
        expect(json['data']['user']['admin']).to be false
        expect(response.headers['Authorization']).to be_present
      end
    end

    context '未確認ユーザーの場合' do
      it 'ログインに失敗する' do
        post '/api/v1/login', params: {
          user: { email: unconfirmed_user.email, password: 'password123' }
        }, as: :json

        # Deviseのconfirmableは未確認ユーザーのログインを拒否します
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context '管理者の場合' do
      it 'ログインに成功しadminフラグがtrueになる' do
        post '/api/v1/login', params: {
          user: { email: admin_user.email, password: 'password123' }
        }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['data']['user']['admin']).to be true
      end
    end

    context '無効な認証情報の場合' do
      it 'ログインに失敗する' do
        post '/api/v1/login', params: {
          user: { email: confirmed_user.email, password: 'wrong_password' }
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/logout' do
    context '認証済みユーザーの場合' do
      it 'ログアウトに成功する' do
        # ログインしてトークンを取得
        post '/api/v1/login', params: {
          user: { email: confirmed_user.email, password: 'password123' }
        }, as: :json
        token = response.headers['Authorization']

        # ログアウト
        delete '/api/v1/logout', headers: { 'Authorization' => token }, as: :json

        expect(response).to have_http_status(:ok)
      end
    end

    context '未認証の場合' do
      it 'ログアウトに成功する（トークンなしでも成功）' do
        delete '/api/v1/logout', as: :json

        # トークンがない場合でもログアウト成功を返す仕様
        expect(response).to have_http_status(:ok)
      end
    end
  end
end
