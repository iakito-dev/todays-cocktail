# frozen_string_literal: true

require 'rails_helper'

# Active Storage をモックするための極小クラス
class DummyAttachment
  attr_reader :payload

  def initialize(attached: false)
    @attached = attached
  end

  def attached?
    @attached
  end

  def attach(payload)
    @attached = true
    @payload = payload
  end
end

# ActiveRecord モデルを模倣するライト級クラス（attachment と id だけ提供）
class DummyImageRecord
  attr_reader :id

  def initialize(id:, attachment:, image_url_override: nil)
    @id = id
    @attachment = attachment
    @image_url_override = image_url_override
  end

  def image
    @attachment
  end

  attr_accessor :image_url_override
end

RSpec.describe ImageDownloadService, type: :service do
  # 画像ダウンロードは HTTP/IO/ActiveStorage の3要素が絡むので、
  # ここでは dummy オブジェクトと URI.open のスタブで純粋にロジックだけ検証する
  describe '.download_and_attach' do
    let(:attachment) { DummyAttachment.new }
    let(:record) { DummyImageRecord.new(id: 42, attachment: attachment) }
    let(:image_url) { 'https://example.com/cocktails/old_fashioned.png' }
    let(:image_data) { "\x89PNGfake-binary-data" }
    let(:downloaded_file) { instance_double(StringIO, read: image_data, close: true) }

    before do
      allow(URI).to receive(:open).and_return(downloaded_file)
      allow(Time).to receive(:current).and_return(Time.zone.local(2025, 1, 1, 12, 0, 0))
    end

    it 'downloads the file, infers the content type, and attaches it' do
      # 成功パス: URI.open → ActiveStorage.attach までの流れを丸ごとシミュレート
      expect(URI).to receive(:open).with(image_url, 'rb').and_return(downloaded_file)

      result = described_class.download_and_attach(record, image_url)

      expect(result).to be(true)
      expect(attachment).to be_attached
      expect(attachment.payload[:filename]).to eq('dummy_image_record_42_1735732800.png')
      expect(attachment.payload[:content_type]).to eq('image/png')
      expect(attachment.payload[:io].string).to eq(image_data)
    end

    it 'returns true immediately when an attachment already exists' do
      # 既に添付済みなら再ダウンロードしない（idempotent）ことを確認
      preattached = DummyAttachment.new(attached: true)
      record_with_image = DummyImageRecord.new(id: 7, attachment: preattached)

      expect(URI).not_to receive(:open)
      expect(described_class.download_and_attach(record_with_image, image_url)).to be(true)
    end

    it 'returns false when the download raises an error' do
      # HTTP 404 などが発生しても例外ではなく false を返して呼び出し側で集計できるようにする
      allow(URI).to receive(:open).and_raise(OpenURI::HTTPError.new('404', StringIO.new))

      expect(described_class.download_and_attach(record, image_url)).to be(false)
    end

    it 'returns false when the URL is blank' do
      # nil/空文字をそのまま open するとエラーになるので早期 return
      expect(described_class.download_and_attach(record, '')).to be(false)
    end
  end

  # バッチ処理は個々の結果をカウントするだけなので、副作用を抑えるため sleep も無効化する
  describe '.batch_download' do
    let(:records) do
      [
        DummyImageRecord.new(id: 1, attachment: DummyAttachment.new, image_url_override: 'https://example.com/a.jpg'),
        DummyImageRecord.new(id: 2, attachment: DummyAttachment.new, image_url_override: 'https://example.com/b.jpg')
      ]
    end

    before do
      allow(described_class).to receive(:sleep) # avoid slowing down the spec suite
    end

    it 'aggregates success and failure counts across records' do
      allow(described_class).to receive(:download_and_attach).and_return(true, false)

      result = described_class.batch_download(records)

      expect(result).to eq(success: 1, failure: 1, total: 2)
    end
  end

  # private メソッドも拡張子処理が壊れるとファイルが認識されないので念のため押さえる
  describe '.generate_filename' do
    let(:record) { DummyImageRecord.new(id: 9, attachment: DummyAttachment.new) }

    it 'falls back to .jpg when no extension is present' do
      # URL に拡張子が無くても JPEG をデフォルトで付与することで ActiveStorage が扱いやすくなる
      filename = described_class.send(:generate_filename, 'https://example.com/image', record)
      expect(filename).to match(/dummy_image_record_9_\d+\.jpg/)
    end
  end
end
