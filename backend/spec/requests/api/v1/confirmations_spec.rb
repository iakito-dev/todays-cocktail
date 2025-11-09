require 'rails_helper'

RSpec.describe 'Api::V1::Confirmations', type: :request do
  describe 'GET /api/v1/confirmation' do
    context '有効な確認トークンの場合' do
      let(:user) { create(:user) }

      it 'ユーザーが確認済みになる' do
        get "/api/v1/confirmation", params: { confirmation_token: user.confirmation_token }

        expect(response).to have_http_status(:ok)
        expect(user.reload.confirmed?).to be true
      end

      it '成功メッセージを返す' do
        get "/api/v1/confirmation", params: { confirmation_token: user.confirmation_token }

        json = JSON.parse(response.body)
        expect(json['status']['code']).to eq(200)
        expect(json['data']['user']['confirmed']).to be true
      end
    end

    context '無効な確認トークンの場合' do
      it 'エラーメッセージを返す' do
        get "/api/v1/confirmation", params: { confirmation_token: 'invalid_token' }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['status']['code']).to eq(422)
      end
    end

    context '確認トークンが指定されていない場合' do
      it 'エラーメッセージを返す' do
        get "/api/v1/confirmation"

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['status']['code']).to eq(422)
      end
    end

    context '既に確認済みのユーザーの場合' do
      let(:confirmed_user) { create(:user, :confirmed) }

      it 'エラーメッセージを返す' do
        # 確認済みユーザーのトークンは無効なので確認できない
        original_token = confirmed_user.confirmation_token
        get "/api/v1/confirmation", params: { confirmation_token: original_token }

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json['status']['code']).to eq(422)
      end
    end
  end

  describe 'POST /api/v1/confirmation' do
    context '有効なメールアドレスの場合' do
      let!(:user) { create(:user, :unconfirmed) }

      before do
        # confirmation_tokenを確実に設定
        user.send_confirmation_instructions
        # テスト開始前にメールをクリア
        ActionMailer::Base.deliveries.clear
      end

      it '確認メールを再送信する' do
        # send_confirmation_instructionsメソッドが呼ばれることを確認
        allow(User).to receive(:send_confirmation_instructions).and_call_original

        post "/api/v1/confirmation", params: { user: { email: user.email } }, as: :json

        expect(User).to have_received(:send_confirmation_instructions)
        expect(response).to have_http_status(:ok)
      end

      it '成功メッセージを返す' do
        post "/api/v1/confirmation", params: { user: { email: user.email } }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        expect(json['status']).to be_present
      end
    end

    context '既に確認済みのユーザーの場合' do
      let(:confirmed_user) { create(:user, :confirmed) }

      it 'エラーメッセージを返す' do
        post "/api/v1/confirmation", params: { user: { email: confirmed_user.email } }

        # Deviseは既に確認済みの場合、send_confirmation_instructionsがnilを返すため404または422を返す可能性
        expect(response).to have_http_status(:not_found).or have_http_status(:unprocessable_entity)
      end
    end

    context '存在しないメールアドレスの場合' do
      it 'エラーメッセージを返す' do
        post "/api/v1/confirmation", params: { user: { email: 'nonexistent@example.com' } }

        # 存在しないメールの場合もDeviseは特別な処理をするため404または422
        expect(response).to have_http_status(:not_found).or have_http_status(:unprocessable_entity)
      end
    end
  end
end
