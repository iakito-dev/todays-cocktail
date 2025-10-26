# ヘルスチェックエンドポイントのテスト
# APIサーバーの生存確認・ステータス確認を行うエンドポイントのテスト

require 'rails_helper'

RSpec.describe 'Health', type: :request do
  # ヘルスチェックエンドポイントが正常に応答することを確認
  # - ロードバランサーやモニタリングツールから使用される
  # - APIサーバーが正常に動作していることを示すステータス200を返す
  it 'returns 200' do
    get '/health'  # GET /health エンドポイントにリクエスト
    expect(response).to have_http_status(:ok), "status=#{response.status}, body=#{response.body[0..200]}"  # HTTPステータス200（OK）が返されることを期待
  end
end
