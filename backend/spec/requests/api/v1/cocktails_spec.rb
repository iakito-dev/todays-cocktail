require 'rails_helper'

RSpec.describe "Api::V1::Cocktails", type: :request do
  describe "GET /api/v1/cocktails" do
    before do
      Cocktail.destroy_all
      create(:cocktail, name: 'マティーニ', base: :gin, instructions: 'ジン ベルモット')
      create(:cocktail, name: 'モヒート', base: :rum, instructions: 'ラム ミント ライム')
    end

    it 'returns success' do
      get '/api/v1/cocktails'
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.size).to be >= 2
    end

    it 'filters by name q' do
      get '/api/v1/cocktails', params: { q: 'モヒ' }
      json = JSON.parse(response.body)
      expect(json.map { |c| c['name'] }).to eq(['モヒート'])
    end

    it 'filters by base' do
      get '/api/v1/cocktails', params: { base: 'gin' }
      json = JSON.parse(response.body)
      expect(json.map { |c| c['name'] }).to eq(['マティーニ'])
    end

    it 'filters by multiple bases' do
      get '/api/v1/cocktails', params: { base: %w[gin rum] }
      json = JSON.parse(response.body)
      expect(json.size).to eq(2)
    end

    it 'filters by ingredients tokens (AND match)' do
      get '/api/v1/cocktails', params: { ingredients: 'ラム, ミント' }
      json = JSON.parse(response.body)
      expect(json.map { |c| c['name'] }).to eq(['モヒート'])
    end
  end

  describe "GET /api/v1/cocktails/:id" do
    let!(:cocktail) { create(:cocktail, :with_ingredients) }

    it 'returns the cocktail with ingredients' do
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
        get '/api/v1/cocktails/todays_pick'
        expect(response).to have_http_status(:success)
      end

      it 'returns a random cocktail' do
        get '/api/v1/cocktails/todays_pick'
        json = JSON.parse(response.body)

        expect(json).to have_key('id')
        expect(json).to have_key('name')
        expect([cocktail1.name, cocktail2.name]).to include(json['name'])
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
    end

    context 'when no cocktails exist' do
      before { Cocktail.destroy_all }

      it 'returns 404' do
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
