# frozen_string_literal: true

require 'httparty'
require 'open-uri'

# Unsplash APIを使用してカクテル画像を検索・ダウンロードするサービス
class UnsplashImageService
  BASE_URL = 'https://api.unsplash.com'
  
  def initialize
    @access_key = ENV['UNSPLASH_ACCESS_KEY']
    raise 'UNSPLASH_ACCESS_KEY is not set' if @access_key.blank?
  end

  # カクテル名で画像を検索してダウンロード
  # @param cocktail [Cocktail] 画像を取得するカクテルオブジェクト
  # @param force [Boolean] 既存の画像を上書きするか
  # @return [Boolean] 成功したかどうか
  def fetch_and_attach_cocktail_image(cocktail, force: false)
    return false if cocktail.image.attached? && !force

    # 検索クエリを構築（カクテル名 + "cocktail"）
    query = "#{cocktail.name} cocktail drink"
    
    begin
      # Unsplash APIで画像を検索
      photo = search_photo(query)
      
      unless photo
        Rails.logger.warn("No image found on Unsplash for: #{cocktail.name}")
        return false
      end

      # 画像をダウンロードしてアタッチ
      download_and_attach(cocktail, photo)
      
      Rails.logger.info("Successfully fetched Unsplash image for: #{cocktail.name}")
      true
    rescue StandardError => e
      Rails.logger.error("Failed to fetch Unsplash image for #{cocktail.name}: #{e.message}")
      false
    end
  end

  # 複数のカクテルに対して画像を一括取得
  # @param cocktails [Array<Cocktail>] カクテルの配列
  # @return [Hash] 成功数と失敗数
  def batch_fetch_images(cocktails)
    success_count = 0
    failure_count = 0
    
    cocktails.each_with_index do |cocktail, index|
      if fetch_and_attach_cocktail_image(cocktail)
        success_count += 1
        puts "  ✅ [#{index + 1}/#{cocktails.size}] #{cocktail.name}"
      else
        failure_count += 1
        puts "  ❌ [#{index + 1}/#{cocktails.size}] #{cocktail.name}"
      end
      
      # Unsplash APIのレート制限を考慮（50 requests/hour）
      sleep 2
    end
    
    {
      success: success_count,
      failure: failure_count,
      total: cocktails.size
    }
  end

  private

  # Unsplash APIで写真を検索
  def search_photo(query)
    response = HTTParty.get(
      "#{BASE_URL}/search/photos",
      query: {
        query: query,
        per_page: 1,
        orientation: 'portrait', # 縦長の画像を優先
        content_filter: 'high' # 高品質な画像のみ
      },
      headers: {
        'Authorization' => "Client-ID #{@access_key}",
        'Accept-Version' => 'v1'
      }
    )

    if response.success?
      results = response.parsed_response['results']
      return nil if results.empty?
      
      results.first
    else
      Rails.logger.error("Unsplash API error: #{response.code} - #{response.body}")
      nil
    end
  end

  # 画像をダウンロードしてActive Storageにアタッチ
  def download_and_attach(cocktail, photo)
    # 高品質な画像URLを取得（regular サイズ: 1080px）
    image_url = photo.dig('urls', 'regular')
    photographer = photo.dig('user', 'name')
    photo_id = photo['id']
    
    # 画像をダウンロード
    image_data = OpenURI.open_uri(image_url, 'rb')
    file_content = image_data.read
    image_data.close
    
    io = StringIO.new(file_content)
    
    # Active Storageにアタッチ
    cocktail.image.attach(
      io: io,
      filename: "#{cocktail.name.parameterize}_unsplash_#{photo_id}.jpg",
      content_type: 'image/jpeg',
      metadata: {
        unsplash_id: photo_id,
        photographer: photographer,
        source: 'unsplash'
      }
    )
    
    # Unsplashのダウンロードエンドポイントを叩く（利用規約で必須）
    track_download(photo)
  end

  # Unsplashのダウンロードを追跡（API利用規約で必須）
  def track_download(photo)
    download_location = photo['links']['download_location']
    
    HTTParty.get(
      download_location,
      headers: {
        'Authorization' => "Client-ID #{@access_key}"
      }
    )
  rescue StandardError => e
    Rails.logger.warn("Failed to track Unsplash download: #{e.message}")
  end
end
