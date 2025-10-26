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

end
