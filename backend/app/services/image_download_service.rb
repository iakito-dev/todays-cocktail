# frozen_string_literal: true

require 'httparty'
require 'open-uri'

# 外部URLから画像をダウンロードしてActive Storageに保存するサービス
class ImageDownloadService
  class DownloadError < StandardError; end

  # 画像をダウンロードしてActive Storageにアタッチ
  # @param record [ActiveRecord::Base] 画像をアタッチする対象のレコード（例: Cocktail）
  # @param image_url [String] 画像のURL
  # @param attachment_name [Symbol] アタッチメント名（デフォルト: :image）
  # @return [Boolean] 成功したかどうか
  def self.download_and_attach(record, image_url, attachment_name: :image)
    return false if image_url.blank?

    # 既に画像がアタッチされている場合はスキップ
    return true if record.send(attachment_name).attached?

    begin
      # 画像をダウンロード
      downloaded_file = URI.open(image_url, 'rb')

      # ファイル名を生成（URLから拡張子を抽出）
      filename = generate_filename(image_url, record)

      # ファイル内容を読み込んでStringIOに変換（ストリームを閉じても安全）
      file_content = downloaded_file.read
      downloaded_file.close

      io = StringIO.new(file_content)

      # Active Storageにアタッチ
      record.send(attachment_name).attach(
        io: io,
        filename: filename,
        content_type: detect_content_type(io)
      )

      Rails.logger.info("Successfully downloaded and attached image for #{record.class.name} ##{record.id}")
      true
    rescue OpenURI::HTTPError => e
      Rails.logger.error("HTTP error downloading image from #{image_url}: #{e.message}")
      false
    rescue StandardError => e
      Rails.logger.error("Error downloading image from #{image_url}: #{e.message}")
      false
    end
  end

  # 複数のレコードに対して画像をバッチダウンロード
  # @param records [Array<ActiveRecord::Base>] 画像をアタッチする対象のレコード配列
  # @param url_method [Symbol] 画像URLを取得するメソッド名（デフォルト: :image_url）
  # @param attachment_name [Symbol] アタッチメント名（デフォルト: :image）
  # @return [Hash] 成功数と失敗数
  def self.batch_download(records, url_method: :image_url, attachment_name: :image)
    success_count = 0
    failure_count = 0

    records.each do |record|
      image_url = record.send(url_method)
      next if image_url.blank?

      if download_and_attach(record, image_url, attachment_name: attachment_name)
        success_count += 1
      else
        failure_count += 1
      end

      # API負荷軽減のため少し待機
      sleep 0.2
    end

    {
      success: success_count,
      failure: failure_count,
      total: records.size
    }
  end

  private_class_method def self.generate_filename(url, record)
    # URLから拡張子を抽出
    extension = File.extname(URI.parse(url).path)
    extension = '.jpg' if extension.blank? # デフォルト拡張子

    # ファイル名を生成（レコードのクラス名とID、タイムスタンプを使用）
    "#{record.class.name.underscore}_#{record.id}_#{Time.current.to_i}#{extension}"
  end

  private_class_method def self.detect_content_type(file)
    # ファイルの先頭バイトからMIMEタイプを推測
    magic_bytes = file.read(12)
    file.rewind

    case magic_bytes
    when /^\xff\xd8\xff/n
      'image/jpeg'
    when /^\x89PNG/n
      'image/png'
    when /^GIF8/n
      'image/gif'
    when /^RIFF....WEBP/n
      'image/webp'
    else
      'image/jpeg' # デフォルト
    end
  end
end
