# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Authentication', type: :request do
  # サインアップ～JWT発行～ログアウトの一連のフローが外部契約どおりかを確認する
  let(:user) { create(:user, :confirmed) }
  let(:valid_credentials) { { user: { email: user.email, password: 'password123' } } }
  let(:invalid_credentials) { { user: { email: user.email, password: 'wrong_password' } } }

  describe 'POST /api/v1/signup' do
    let(:valid_attributes) do
      {
        user: {
          email: 'newuser@example.com',
          password: 'password123',
          password_confirmation: 'password123'
        }
      }
    end

    context '有効なパラメータの場合' do
      it '新しいユーザーを作成する' do
        expect {
          post '/api/v1/signup', params: valid_attributes, as: :json
        }.to change(User, :count).by(1)
      end

      it '200ステータスを返す' do
        post '/api/v1/signup', params: valid_attributes, as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'ユーザー情報を含むJSONレスポンスを返す' do
        # API クライアントがレスポンス本文だけでなく status コードを見て処理するため
        post '/api/v1/signup', params: valid_attributes, as: :json
        json_response = JSON.parse(response.body)
        expect(json_response['status']['code']).to eq(200)
        expect(json_response['data']['user']['email']).to eq('newuser@example.com')
      end

      it '確認メールを送信する' do
        expect {
          post '/api/v1/signup', params: valid_attributes, as: :json
        }.to change { ActionMailer::Base.deliveries.count }.by(1)
      end
    end

    context '無効なパラメータの場合' do
      it 'パスワード確認が一致しない場合、ユーザーを作成しない' do
        invalid_params = valid_attributes.deep_dup
        invalid_params[:user][:password_confirmation] = 'different_password'

        expect {
          post '/api/v1/signup', params: invalid_params, as: :json
        }.not_to change(User, :count)
      end

      it '422ステータスを返す' do
        invalid_params = valid_attributes.deep_dup
        invalid_params[:user][:password_confirmation] = 'different_password'

        post '/api/v1/signup', params: invalid_params, as: :json
        expect(response).to have_http_status(:unprocessable_content)
      end

      it 'エラーメッセージを含むJSONレスポンスを返す' do
        # バリデーションメッセージはフロント側でそのまま表示するため、日本語で返ってくるかも検証
        invalid_params = valid_attributes.deep_dup
        invalid_params[:user][:email] = ''

        post '/api/v1/signup', params: invalid_params, as: :json
        json_response = JSON.parse(response.body)
        expect(json_response['status']['code']).to eq(422)
        expect(json_response['errors']).to be_present
      end
    end
  end

  describe 'POST /api/v1/login' do
    context '有効な認証情報の場合' do
      it '200ステータスを返す' do
        post '/api/v1/login', params: valid_credentials, as: :json
        expect(response).to have_http_status(:ok)
      end

      it 'JWTトークンを含むレスポンスを返す' do
        # Authorization ヘッダーが欠けていると以降の保護APIが呼べないので必須チェック
        post '/api/v1/login', params: valid_credentials, as: :json
        expect(response.headers['Authorization']).to be_present
        expect(response.headers['Authorization']).to match(/^Bearer .+/)
      end

      it 'ユーザー情報を含むJSONレスポンスを返す' do
        post '/api/v1/login', params: valid_credentials, as: :json
        json_response = JSON.parse(response.body)
        expect(json_response['status']['code']).to eq(200)
        expect(json_response['status']['message']).to eq('ログインに成功しました。')
        expect(json_response['data']['user']['id']).to eq(user.id)
        expect(json_response['data']['user']['email']).to eq(user.email)
      end
    end

    context '無効な認証情報の場合' do
      it '401ステータスを返す' do
        post '/api/v1/login', params: invalid_credentials, as: :json
        expect(response).to have_http_status(:unauthorized)
      end

      it 'エラーメッセージを含むJSONレスポンスを返す' do
        post '/api/v1/login', params: invalid_credentials, as: :json
        json_response = JSON.parse(response.body)
        expect(json_response['errors']).to be_present
      end

      it 'JWTトークンを含まない' do
        # 誤ったパスワードでトークンが発行されるとセキュリティ事故になるため明示的に確認
        post '/api/v1/login', params: invalid_credentials, as: :json
        expect(response.headers['Authorization']).to be_nil
      end
    end
  end

  describe 'DELETE /api/v1/logout' do
    let(:auth_headers) do
      post '/api/v1/login', params: valid_credentials, as: :json
      { 'Authorization' => response.headers['Authorization'] }
    end

    context '認証済みユーザーの場合' do
      it '200ステータスを返す' do
        delete '/api/v1/logout', headers: auth_headers
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを含むJSONレスポンスを返す' do
        delete '/api/v1/logout', headers: auth_headers
        json_response = JSON.parse(response.body)
        expect(json_response['status']['code']).to eq(200)
        expect(json_response['status']['message']).to eq('ログアウトしました。')
      end

      it 'トークンを無効化リストに追加する' do
        token = auth_headers['Authorization'].split(' ').last
        decoded_token = JWT.decode(
          token,
          Rails.application.config.x.jwt_secret_key,
          true,
          { algorithm: 'HS256' }
        )
        jti = decoded_token[0]['jti']

        expect {
          delete '/api/v1/logout', headers: auth_headers
        }.to change { JwtDenylist.exists?(jti: jti) }.from(false).to(true)
      end

      it 'ログアウト後、同じトークンではアクセスできない' do
        # Denylist 登録が効いているかどうかは保護エンドポイントで 401 を確認するのが手っ取り早い
        delete '/api/v1/logout', headers: auth_headers

        # ログアウト後に保護されたエンドポイントにアクセス
        get '/api/v1/favorites', headers: auth_headers
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
