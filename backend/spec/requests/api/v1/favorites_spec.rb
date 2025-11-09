# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Favorites', type: :request do
  # JWT 認証とお気に入り CRUD の組み合わせをブラックボックス的に検証する
  let(:user) { create(:user, :confirmed) }
  let(:other_user) { create(:user, :confirmed) }
  let(:cocktail) { create(:cocktail) }
  let(:auth_headers) do
    post '/api/v1/login', params: { user: { email: user.email, password: 'password123' } }, as: :json
    { 'Authorization' => response.headers['Authorization'] }
  end

  describe 'GET /api/v1/favorites' do
    context '認証済みユーザーの場合' do
      before do
        # ユーザーのお気に入りを作成
        create(:favorite, user: user, cocktail: cocktail)
        create(:favorite, user: user, cocktail: create(:cocktail))
        # 他のユーザーのお気に入りを作成（表示されないはず）
        create(:favorite, user: other_user, cocktail: create(:cocktail))
      end

      it '200ステータスを返す' do
        # 認証ヘッダーが正しく付いていれば一覧取得が成功することをまず確認
        get '/api/v1/favorites', headers: auth_headers
        expect(response).to have_http_status(:ok)
      end

      it 'ユーザーのお気に入り一覧を返す' do
        get '/api/v1/favorites', headers: auth_headers
        json_response = JSON.parse(response.body)

        expect(json_response['status']['code']).to eq(200)
        expect(json_response['data'].length).to eq(2)
      end

      it '他のユーザーのお気に入りは含まれない' do
        # N+1 や join の条件が崩れると別ユーザーのデータが混ざる可能性があるので念押し
        get '/api/v1/favorites', headers: auth_headers
        json_response = JSON.parse(response.body)

        cocktail_ids = json_response['data'].map { |fav| fav['cocktail']['id'] }
        expect(cocktail_ids).not_to include(other_user.favorite_cocktails.first.id)
      end

      it 'カクテル情報と作成日時を含む' do
        # API レスポンスをそのまま UI が描画するので、必要フィールドが揃っているかを確認
        get '/api/v1/favorites', headers: auth_headers
        json_response = JSON.parse(response.body)

        first_favorite = json_response['data'].first
        expect(first_favorite).to have_key('id')
        expect(first_favorite).to have_key('cocktail')
        expect(first_favorite).to have_key('created_at')
        expect(first_favorite['cocktail']).to have_key('name')
        expect(first_favorite['cocktail']).to have_key('base')
      end

      # eager load 済みのカクテル情報（日本語フィールドや image_url）をそのまま返し、
      # created_at の降順で並んでいることを確認する E2E テスト
      it 'returns newest favorites first with fully hydrated cocktail fields' do
        older_favorite = user.favorites.order(:created_at).first
        newer_cocktail = create(:cocktail, name: '最新カクテル', name_ja: '最新', glass_ja: 'グラス', instructions_ja: '手順')
        newer_favorite = create(:favorite, user: user, cocktail: newer_cocktail, created_at: 1.minute.from_now)

        get '/api/v1/favorites', headers: auth_headers
        json_response = JSON.parse(response.body)

        returned_ids = json_response['data'].map { |fav| fav['id'] }
        expect(returned_ids.first).to eq(newer_favorite.id)
        expect(returned_ids.last).to eq(older_favorite.id)

        cocktail_payload = json_response['data'].first['cocktail']
        expect(cocktail_payload).to include(
          'name' => '最新カクテル',
          'name_ja' => '最新',
          'glass_ja' => 'グラス',
          'instructions_ja' => '手順',
          'is_favorited' => true
        )
        expect(cocktail_payload).to have_key('image_url')
      end
    end

    context '認証されていないユーザーの場合' do
      it '401ステータスを返す' do
        get '/api/v1/favorites'
        expect(response).to have_http_status(:unauthorized)
      end

      it 'エラーメッセージを返す' do
        get '/api/v1/favorites'
        json_response = JSON.parse(response.body)
        expect(json_response['error']).to eq('認証が必要です。ログインしてください。')
      end
    end
  end

  describe 'POST /api/v1/favorites' do
    let(:valid_params) { { cocktail_id: cocktail.id } }

    context '認証済みユーザーの場合' do
      it '201ステータスを返す' do
        # 作成成功時は201で返す契約なのでステータスコードも固定でチェック
        post '/api/v1/favorites', params: valid_params, headers: auth_headers, as: :json
        expect(response).to have_http_status(:created)
      end

      it 'お気に入りを作成する' do
        expect {
          post '/api/v1/favorites', params: valid_params, headers: auth_headers, as: :json
        }.to change(user.favorites, :count).by(1)
      end

      it '成功メッセージとお気に入り情報を返す' do
        # JSON の shape が変わるとフロントが壊れるため構造を厳密に検証
        post '/api/v1/favorites', params: valid_params, headers: auth_headers, as: :json
        json_response = JSON.parse(response.body)

        expect(json_response['status']['code']).to eq(201)
        expect(json_response['status']['message']).to eq('お気に入りに追加しました。')
        expect(json_response['data']['cocktail']['id']).to eq(cocktail.id)
        expect(json_response['data']['cocktail']['is_favorited']).to be true
      end

      context '既にお気に入りに追加済みの場合' do
        before { create(:favorite, user: user, cocktail: cocktail) }

        it '422ステータスを返す' do
          post '/api/v1/favorites', params: valid_params, headers: auth_headers, as: :json
          expect(response).to have_http_status(:unprocessable_content)
        end

        it '重複エラーメッセージを返す' do
          # message が日本語のまま返ることもアサートしておくと UX で崩れない
          post '/api/v1/favorites', params: valid_params, headers: auth_headers, as: :json
          json_response = JSON.parse(response.body)

          expect(json_response['status']['code']).to eq(422)
          expect(json_response['errors']).to be_present
        end
      end

      context '存在しないカクテルIDの場合' do
        let(:invalid_params) { { cocktail_id: 99999 } }

        it '404ステータスを返す' do
          post '/api/v1/favorites', params: invalid_params, headers: auth_headers, as: :json
          expect(response).to have_http_status(:not_found)
        end

        it 'エラーメッセージを返す' do
          post '/api/v1/favorites', params: invalid_params, headers: auth_headers, as: :json
          json_response = JSON.parse(response.body)

          expect(json_response['status']['message']).to eq('カクテルが見つかりません。')
        end
      end
    end

    context '認証されていないユーザーの場合' do
      it '401ステータスを返す' do
        post '/api/v1/favorites', params: valid_params, as: :json
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'DELETE /api/v1/favorites/:id' do
    let!(:favorite) { create(:favorite, user: user, cocktail: cocktail) }
    let!(:other_favorite) { create(:favorite, user: other_user, cocktail: create(:cocktail)) }

    context '認証済みユーザーの場合' do
      it '200ステータスを返す' do
        delete "/api/v1/favorites/#{favorite.id}", headers: auth_headers
        expect(response).to have_http_status(:ok)
      end

      it 'お気に入りを削除する' do
        expect {
          delete "/api/v1/favorites/#{favorite.id}", headers: auth_headers
        }.to change(user.favorites, :count).by(-1)
      end

      it '成功メッセージを返す' do
        # フロントでは toast で message を読ませるためレスポンス本文も確認
        delete "/api/v1/favorites/#{favorite.id}", headers: auth_headers
        json_response = JSON.parse(response.body)

        expect(json_response['status']['code']).to eq(200)
        expect(json_response['status']['message']).to eq('お気に入りから削除しました。')
      end

      context '他のユーザーのお気に入りを削除しようとした場合' do
        it '404ステータスを返す' do
          # current_user scope が効いていないと 404 にならず削除できてしまうので要チェック
          delete "/api/v1/favorites/#{other_favorite.id}", headers: auth_headers
          expect(response).to have_http_status(:not_found)
        end

        it 'お気に入りを削除しない' do
          expect {
            delete "/api/v1/favorites/#{other_favorite.id}", headers: auth_headers
          }.not_to change(Favorite, :count)
        end
      end

      context '存在しないお気に入りIDの場合' do
        it '404ステータスを返す' do
          delete '/api/v1/favorites/99999', headers: auth_headers
          expect(response).to have_http_status(:not_found)
        end
      end
    end

    context '認証されていないユーザーの場合' do
      it '401ステータスを返す' do
        # 認証無しで DELETE が成功すると他人のデータが壊れるため最重要チェック
        delete "/api/v1/favorites/#{favorite.id}"
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
