require 'rails_helper'

RSpec.describe JwtDenylist, type: :model do
  # Section: Strategy — Devise::JWT denylist が取り込まれているか
  describe 'revocation strategy' do
    it 'includes the Devise denylist strategy' do
      expect(described_class.ancestors).to include(Devise::JWT::RevocationStrategies::Denylist)
    end
  end

  # Section: Schema — シンプルなテーブルに jti / exp を保存できること
  describe 'schema' do
    it 'uses the jwt_denylists table' do
      expect(described_class.table_name).to eq('jwt_denylists')
    end

    it 'persists revoked tokens' do
      # ログアウト時に jti/exp をそのまま保存するため、単純な create! が成功するか確認
      record = described_class.create!(jti: 'abc', exp: 1.hour.from_now)
      expect(described_class.exists?(record.id)).to be(true)
    end
  end
end
