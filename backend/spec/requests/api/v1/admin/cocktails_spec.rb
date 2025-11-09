# frozen_string_literal: true

require 'rails_helper'

# rubocop:disable Metrics/BlockLength
RSpec.describe 'Api::V1::Admin::Cocktails', type: :request do
  # Admin API は JWT 認証 + 権限チェック + キャッシュ削除という複合動作なので
  # ここでは「誰が / どうリクエストしたか」でレスポンスがどう変化するかを丸ごと検証する
  # 管理者がカクテル情報を更新する際の振る舞いを網羅的に検証する
  # 認証フローまで含めた E2E に近いテストなので、FactoryBot でユーザーやカクテルを都度用意する
  let!(:cocktail) do
    create(
      :cocktail,
      name: 'Old Fashioned',
      name_ja: 'オールドファッションド',
      description: 'Classic whiskey cocktail'
    )
  end

  let(:admin_user) { create(:user, :admin) }
  let(:regular_user) { create(:user, :confirmed) }

  let(:admin_headers) do
    # API リクエストの前に一度ログインを行い、そのレスポンスヘッダーから JWT を取り出す
    post '/api/v1/login', params: {
      user: { email: admin_user.email, password: 'password123' }
    }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  let(:user_headers) do
    # 通常ユーザーでも同じように JWT を取得するが、権限チェックで弾かれることを確認したい
    post '/api/v1/login', params: {
      user: { email: regular_user.email, password: 'password123' }
    }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  before do
    # キャッシュのテストを安定させるため事前にクリア
    Rails.cache.clear
  end

  describe 'PUT /api/v1/admin/cocktails/:id' do
    let(:params) do
      {
        cocktail: {
          name: 'New Fashioned',
          name_ja: 'ニューオールドファッションド',
          description: 'Updated description',
          base: 'whisky',
          strength: 'strong',
          technique: 'stir',
          image_url_override: 'https://example.com/new.jpg'
        }
      }
    end

    context 'when admin user updates a cocktail' do
      # 正常系: レスポンス内容と関連キャッシュの削除をチェック
      # Rails.cache を直接書き換えて「古いキャッシュが残っている」状況を再現してからテストを開始する
      it 'returns the updated cocktail with refreshed attributes' do
        Rails.cache.write("cocktail_show_#{cocktail.id}", :stale_value)
        Rails.cache.write("todays_pick_#{Date.today}", :stale_pick)
        Rails.cache.write('cocktails_index_filters', :stale_list)

        put "/api/v1/admin/cocktails/#{cocktail.id}", params: params, headers: admin_headers, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body)
        # 返却された JSON のフィールドが送信した内容に置き換わっているかを確認
        expect(json['name']).to eq('New Fashioned')
        expect(json['name_ja']).to eq('ニューオールドファッションド')
        expect(json['description']).to eq('Updated description')
        expect(json['base']).to eq('whisky')
        expect(json['strength']).to eq('strong')
        expect(json['technique']).to eq('stir')
        expect(json['image_url']).to eq('https://example.com/new.jpg')

        # キャッシュキーを直接参照して、更新後に手動で削除されているかどうかを検証する
        expect(Rails.cache.exist?("cocktail_show_#{cocktail.id}")).to be(false)
        expect(Rails.cache.exist?("todays_pick_#{Date.today}")).to be(false)
        expect(Rails.cache.exist?('cocktails_index_filters')).to be(false)
      end
    end

    context 'when a non-admin user attempts to update' do
      # 権限不足の場合に 403 となることを確認
      # 通常ユーザーでログイン → 同じ更新エンドポイントにアクセス → 403: Forbidden を期待する
      it 'returns forbidden' do
        # admin? が false のユーザーには 403 を返して UI のガードも簡単にする
        put "/api/v1/admin/cocktails/#{cocktail.id}", params: params, headers: user_headers, as: :json

        expect(response).to have_http_status(:forbidden)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('管理者権限が必要です')
      end
    end

    context 'when unauthenticated' do
      # トークンなしアクセスは 401
      # Rails の `authenticate_user!` が正しく弾いているかを確認する
      it 'returns unauthorized' do
        # 認証そのものが無い場合は 401。ここが 403 になると UX 上の区別が付かなくなる
        put "/api/v1/admin/cocktails/#{cocktail.id}", params: params, as: :json

        expect(response).to have_http_status(:unauthorized)
        json = JSON.parse(response.body)
        expect(json['error']).to eq('認証が必要です。ログインしてください。')
      end
    end

    context 'when invalid parameters are provided' do
      # バリデーションエラー時の応答を日本語メッセージまで含めて確認
      # name を空文字にすることで ActiveRecord の presence バリデーションを意図的に失敗させる
      it 'returns validation errors' do
        invalid_params = {
          cocktail: {
            name: ''
          }
        }

        put "/api/v1/admin/cocktails/#{cocktail.id}", params: invalid_params, headers: admin_headers, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        json = JSON.parse(response.body)
        expect(json['errors']).to include('Name を入力してください')
      end
    end
  end
end
# rubocop:enable Metrics/BlockLength
