# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UnsplashImageService, type: :service do
  # Unsplash への HTTP はすべて HTTParty 経由なので、レスポンスオブジェクトをダブル化して
  # 「検索成功 / 失敗 / 空配列 / ダウンロード追跡エラー」を網羅する
  let(:original_key) { ENV['UNSPLASH_ACCESS_KEY'] }
  let(:access_key) { 'unsplash-test-key' }
  let(:photo_payload) do
    {
      'id' => 'abc123',
      'urls' => { 'regular' => 'https://images.example.com/cocktail.jpg' },
      'links' => { 'download_location' => 'https://api.unsplash.com/photos/abc123/download' }
    }
  end
  let(:search_response) do
    instance_double(HTTParty::Response, success?: true, parsed_response: { 'results' => [ photo_payload ] })
  end
  let(:download_response) { instance_double(HTTParty::Response, success?: true, parsed_response: {}) }

  before do
    ENV['UNSPLASH_ACCESS_KEY'] = access_key
  end

  after do
    ENV['UNSPLASH_ACCESS_KEY'] = original_key
  end

  describe '#fetch_and_attach_cocktail_image' do
    let(:service) { described_class.new }
    let(:cocktail) do
      instance_double(Cocktail, name: 'Negroni', image_url_override: nil).tap do |dbl|
        allow(dbl).to receive(:update!)
      end
    end

    before do
      allow(HTTParty).to receive(:get).and_return(search_response, download_response)
    end

    it 'returns false without calling the API when an override already exists' do
      # 管理画面で手動設定された URL があれば API コール自体スキップする仕様
      existing = instance_double(Cocktail, name: 'Martini', image_url_override: 'https://existing.example')

      expect(HTTParty).not_to receive(:get)
      expect(service.fetch_and_attach_cocktail_image(existing)).to be(false)
    end

    # 正常系: 取得した URL でレコードを更新し、Download API も叩いているかを検証
    it 'updates the cocktail with the returned image URL and tracks the download' do
      expect(cocktail).to receive(:update!).with(image_url_override: 'https://images.example.com/cocktail.jpg')

      result = service.fetch_and_attach_cocktail_image(cocktail)

      expect(result).to be(true)
      expect(HTTParty).to have_received(:get).with(
        "#{described_class::BASE_URL}/search/photos",
        hash_including(query: hash_including(query: 'Negroni cocktail drink'))
      )
      expect(HTTParty).to have_received(:get).with(
        'https://api.unsplash.com/photos/abc123/download',
        hash_including(headers: hash_including('Authorization' => "Client-ID #{access_key}"))
      )
    end

    it 'returns false when Unsplash does not return results' do
      # 検索結果が空なら nil を返し、別経路（例: fallback画像）に任せる
      empty_response = instance_double(HTTParty::Response, success?: true, parsed_response: { 'results' => [] })
      allow(HTTParty).to receive(:get).and_return(empty_response)

      expect(service.fetch_and_attach_cocktail_image(cocktail)).to be(false)
    end

    # 利用規約上ダウンロード報告は必須だが、失敗してもメインフローは継続させたいのでその挙動もテスト
    it 'swallows download tracking errors and still reports success' do
      allow(HTTParty).to receive(:get).with(
        "#{described_class::BASE_URL}/search/photos",
        anything
      ).and_return(search_response)
      allow(HTTParty).to receive(:get).with('https://api.unsplash.com/photos/abc123/download', anything).and_raise(StandardError, 'boom')

      expect(cocktail).to receive(:update!).with(image_url_override: 'https://images.example.com/cocktail.jpg')
      expect(service.fetch_and_attach_cocktail_image(cocktail)).to be(true)
    end

    it 'returns false when the API call fails' do
      # 429 等の失敗コードが返った場合も false を返し、バッチ側でカウントできるようにする
      failure_response = instance_double(HTTParty::Response, success?: false, code: 429, body: 'rate limited')
      allow(HTTParty).to receive(:get).and_return(failure_response)

      expect(service.fetch_and_attach_cocktail_image(cocktail)).to be(false)
    end
  end

  # 複数件呼び出し時は sleep/puts を無効化して件数カウントだけを見る
  describe '#batch_fetch_images' do
    let(:service) { described_class.new }
    let(:cocktails) do
      [
        instance_double(Cocktail, name: 'Mojito', image_url_override: nil),
        instance_double(Cocktail, name: 'Martini', image_url_override: nil)
      ]
    end

    before do
      allow(service).to receive(:puts)
      allow(service).to receive(:sleep)
    end

    it 'counts successes and failures across the batch' do
      allow(service).to receive(:fetch_and_attach_cocktail_image).and_return(true, false)

      result = service.batch_fetch_images(cocktails)

      expect(result).to eq(success: 1, failure: 1, total: 2)
    end
  end
end
