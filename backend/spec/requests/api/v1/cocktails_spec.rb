require 'rails_helper'

RSpec.describe "Api::V1::Cocktails", type: :request do
  # API の外部契約を守ることが目的。Rails の内部実装を知らなくても
  # 「どのエンドポイントがどう振る舞うべきか」が読み取れるように書く。
  include ActiveSupport::Testing::TimeHelpers

  describe "GET /api/v1/cocktails" do
    before do
      Cocktail.destroy_all
      create(:cocktail, name: 'マティーニ', base: :gin, instructions: 'ジン ベルモット')
      create(:cocktail, name: 'モヒート', base: :rum, instructions: 'ラム ミント ライム')
    end

    it 'returns success' do
      # 最小の smoke テスト: エンドポイントが 200 を返し JSON 形式で応答するか
      get '/api/v1/cocktails'
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.size).to be >= 2
    end

    it 'filters by name q' do
      # q パラメータは名前・材料に対する部分一致。ここでは日本語ワードでマッチするかを検証
      get '/api/v1/cocktails', params: { q: 'モヒ' }
      json = JSON.parse(response.body)
      expect(json['cocktails'].map { |c| c['name'] }).to eq([ 'モヒート' ])
    end

    it 'filters by base' do
      get '/api/v1/cocktails', params: { base: 'gin' }
      json = JSON.parse(response.body)
      expect(json['cocktails'].map { |c| c['name'] }).to eq([ 'マティーニ' ])
    end

    it 'filters by multiple bases' do
      get '/api/v1/cocktails', params: { base: %w[gin rum] }
      json = JSON.parse(response.body)
      expect(json['cocktails'].size).to eq(2)
    end

    it 'filters by ingredients tokens (AND match)' do
      # カンマ区切りで複数食材を渡したときに AND 検索になるか確認
      get '/api/v1/cocktails', params: { ingredients: 'ラム, ミント' }
      json = JSON.parse(response.body)
      expect(json['cocktails'].map { |c| c['name'] }).to eq([ 'モヒート' ])
    end

    it 'orders by id ascending by default' do
      create(:cocktail, name: 'サイドカー')
      get '/api/v1/cocktails'
      ids = JSON.parse(response.body)['cocktails'].map { |c| c['id'] }
      expect(ids).to eq(ids.sort)
    end

    it 'sorts by favorites count when sort=popular' do
      # 人気順は favorites の件数を LEFT JOIN してソートする仕様。そのまま検証
      mojito = Cocktail.find_by!(name: 'モヒート')
      martini = Cocktail.find_by!(name: 'マティーニ')

      create(:favorite, cocktail: mojito)
      create(:favorite, cocktail: mojito)
      create(:favorite, cocktail: martini)

      get '/api/v1/cocktails', params: { sort: 'popular' }
      names = JSON.parse(response.body)['cocktails'].map { |c| c['name'] }
      expect(names.first).to eq('モヒート')
    end

    # page/per_page が指定されたときのページネーション情報を丸ごと確認しておく
    # → UI 側で「何ページあるか」「合計件数はいくつか」を表示する前提のため
    it 'respects page/per_page params and returns accurate metadata' do
      create_list(:cocktail, 3)
      get '/api/v1/cocktails', params: { page: 2, per_page: 2 }

      json = JSON.parse(response.body)
      expect(json['cocktails'].size).to eq(2)
      expect(json['meta']['current_page']).to eq(2)
      expect(json['meta']['per_page']).to eq(2)
      expect(json['meta']['total_pages']).to eq(3)
      expect(json['meta']['total_count']).to be >= 5
    end

    # 同じ検索条件でも page/per_page/sort が違えば別キャッシュになることを担保する
    # Rails.cache.fetch を hook し、実際に使われたキーを収集して比較する
    it 'generates distinct cache entries for different pagination parameters' do
      Rails.cache.clear
      cache_keys = []
      allow(Rails.cache).to receive(:fetch).and_wrap_original do |method, *args, &block|
        cache_keys << args.first if args.first.is_a?(String) && args.first.start_with?('cocktails_index_')
        method.call(*args, &block)
      end

      get '/api/v1/cocktails', params: { page: '1', per_page: '1', sort: 'id' }
      get '/api/v1/cocktails', params: { page: '2', per_page: '1', sort: 'id' }

      expect(cache_keys).to include(
        cocktails_index_cache_key(page: '1', per_page: '1', sort: 'id'),
        cocktails_index_cache_key(page: '2', per_page: '1', sort: 'id')
      )
      expect(cache_keys.uniq.size).to be >= 2
    end

    def cocktails_index_cache_key(q: nil, base: nil, technique: nil, strength: nil, ingredients: nil, page: nil, per_page: nil, sort: 'id')
      payload = {
        q: q,
        base: base,
        technique: technique,
        strength: strength,
        ingredients: ingredients,
        page: page,
        per_page: per_page,
        sort: sort
      }.to_json
      "cocktails_index_#{payload}"
    end
  end

  describe "GET /api/v1/cocktails/:id" do
    let!(:cocktail) { create(:cocktail, :with_ingredients) }

    it 'returns the cocktail with ingredients' do
      # show API では材料リストを含んだ詳細情報を返す。JSON shape をそのまま検証
      get "/api/v1/cocktails/#{cocktail.id}"

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['id']).to eq(cocktail.id)
      expect(json['name']).to eq(cocktail.name)
      expect(json['ingredients']).to be_an(Array)
      expect(json['ingredients'].size).to eq(2)
    end

    it 'returns 404 for non-existent cocktail' do
      get '/api/v1/cocktails/99999'
      expect(response).to have_http_status(:not_found)
    end

    it 'includes all required cocktail fields' do
      get "/api/v1/cocktails/#{cocktail.id}"

      json = JSON.parse(response.body)
      expect(json).to have_key('id')
      expect(json).to have_key('name')
      expect(json).to have_key('base')
      expect(json).to have_key('strength')
      expect(json).to have_key('technique')
      expect(json).to have_key('ingredients')
    end

    it 'orders ingredients by position' do
      get "/api/v1/cocktails/#{cocktail.id}"

      json = JSON.parse(response.body)
      ingredients = json['ingredients']
      expect(ingredients.first['position']).to eq(1)
      expect(ingredients.last['position']).to eq(2)
    end
  end

  describe "GET /api/v1/cocktails/todays_pick" do
    context 'when cocktails exist' do
      let!(:cocktail1) { create(:cocktail, :with_ingredients, name: 'マティーニ') }
      let!(:cocktail2) { create(:cocktail, :with_ingredients, name: 'モヒート') }

      it 'returns success' do
        # ランダム取得とはいえ最低限 200 が返ることは保証しておく
        get '/api/v1/cocktails/todays_pick'
        expect(response).to have_http_status(:success)
      end

      it 'returns a random cocktail' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)

        expect(json).to have_key('id')
        expect(json).to have_key('name')
        expect([ cocktail1.name, cocktail2.name ]).to include(json['name'])
      end

      it 'includes ingredients in the response' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)

        expect(json).to have_key('ingredients')
        expect(json['ingredients']).to be_an(Array)
        expect(json['ingredients'].size).to be > 0
      end

      it 'includes all required cocktail fields' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)

        expect(json).to have_key('id')
        expect(json).to have_key('name')
        expect(json).to have_key('base')
        expect(json).to have_key('strength')
        expect(json).to have_key('technique')
        expect(json).to have_key('image_url')
        expect(json).to have_key('instructions')
        expect(json).to have_key('glass')
      end

      it 'includes ingredient details with name, amount, and position' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)

        ingredient = json['ingredients'].first
        expect(ingredient).to have_key('name')
        expect(ingredient).to have_key('amount')
        expect(ingredient).to have_key('position')
      end

      # 今日のおすすめは「日付ごとに一意のキャッシュキー」を使う仕様。
      # 日付が変わると必ず別キーが呼ばれるかどうかを hook して検証する。
      it 'uses date-specific cache keys so a new day returns fresh data' do
        Rails.cache.clear
        cache_keys = []
        allow(Rails.cache).to receive(:fetch).and_wrap_original do |method, *args, &block|
          cache_keys << args.first if args.first.is_a?(String) && args.first.start_with?('todays_pick_')
          method.call(*args, &block)
        end

        travel_to(Time.zone.local(2025, 1, 1, 10, 0, 0)) do
          get '/api/v1/cocktails/todays_pick'
        end

        travel_to(Time.zone.local(2025, 1, 2, 9, 0, 0)) do
          get '/api/v1/cocktails/todays_pick'
        end

        expect(cache_keys).to include('todays_pick_2025-01-01', 'todays_pick_2025-01-02')
      end
    end

    context 'when no cocktails exist' do
      before do
        Rails.cache.clear
        Cocktail.destroy_all
      end

      it 'returns 404' do
        # レコードゼロのときは 404 + error JSON を返すことでフロントがリトライできる
        get '/api/v1/cocktails/todays_pick'
        expect(response).to have_http_status(:not_found)
      end

      it 'returns error message' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)
        expect(json).to have_key('error')
      end
    end
  end
end
