# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Users', type: :request do
  # 認証付きのマイページ取得 API が期待どおりに振る舞うかを確認する
  # 「リクエストスペック」は実際の HTTP リクエストを想定してレスポンスのJSON内容まで検証するテスト
  describe 'GET /api/v1/users/me' do
    let(:user) { create(:user, :confirmed, name: 'Taro User') }

    context 'when authenticated' do
      # 正しいトークンを付与した場合に 200 とユーザー情報が返ることを検証
      # before ブロックを使わず let でログインヘッダーを定義しているのは
      # 「このテスト内でのみログイン処理を実行し、その結果を使い回す」ため
      let(:auth_headers) do
        post '/api/v1/login', params: {
          user: { email: user.email, password: 'password123' }
        }, as: :json
        # ログインすると Authorization ヘッダーとして JWT が返ってくるので
        # それを次のリクエストにそのまま添付する
        { 'Authorization' => response.headers['Authorization'] }
      end

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
end
