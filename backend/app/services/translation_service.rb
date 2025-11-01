# frozen_string_literal: true

require 'net/http'
require 'json'

# OpenAI APIを使用してカクテル関連のテキストを翻訳するサービス
# レート制限時はDeepL APIにフォールバック
class TranslationService
  class TranslationError < StandardError; end

  def initialize
    @client = OpenAI::Client.new(access_token: ENV.fetch('OPENAI_API_KEY'))
    @deepl_api_key = ENV['DEEPL_API_KEY']
    @use_deepl_fallback = @deepl_api_key.present?
  end

  # カクテル名を翻訳
  def translate_cocktail_name(name)
    return nil if name.blank?

    prompt = <<~PROMPT
      以下のカクテル名を日本語に翻訳してください。
      一般的なカクテル名の場合はカタカナで、固有名詞的な場合はそのままカタカナ転写してください。
      翻訳結果のみを返してください（説明は不要です）。

      カクテル名: #{name}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for cocktail name '#{name}': #{e.message}")
    nil
  end

  # 材料名を翻訳
  def translate_ingredient_name(name)
    return nil if name.blank?

    prompt = <<~PROMPT
      以下のカクテル材料名を日本語に翻訳してください。
      一般的な材料名（例: Gin → ジン）はカタカナで、より説明的な材料（例: Fresh lime juice → 新鮮なライムジュース）は自然な日本語で翻訳してください。
      翻訳結果のみを返してください（説明は不要です）。

      材料名: #{name}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for ingredient '#{name}': #{e.message}")
    nil
  end

  # 分量を翻訳
  def translate_measure(measure)
    return nil if measure.blank?

    prompt = <<~PROMPT
      以下のカクテルの分量表記を日本語に翻訳してください。
      単位（oz, ml, dash, etc.）も含めて自然な日本語にしてください。
      翻訳結果のみを返してください（説明は不要です）。

      分量: #{measure}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for measure '#{measure}': #{e.message}")
    nil
  end

  # グラス名を翻訳
  def translate_glass(glass)
    return nil if glass.blank?

    prompt = <<~PROMPT
      以下のグラス名を日本語に翻訳してください。
      一般的なグラス名はカタカナで表記してください。
      翻訳結果のみを返してください（説明は不要です）。

      グラス名: #{glass}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for glass '#{glass}': #{e.message}")
    nil
  end

  # 作り方を翻訳
  def translate_instructions(instructions)
    return nil if instructions.blank?

    prompt = <<~PROMPT
      以下のカクテルの作り方を日本語に翻訳してください。
      自然で分かりやすい日本語で、カクテル作りの手順として翻訳してください。
      翻訳結果のみを返してください（説明は不要です）。

      作り方: #{instructions}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for instructions: #{e.message}")
    nil
  end

  # バッチ翻訳（複数の材料名を一度に翻訳）
  def translate_ingredients_batch(ingredient_names)
    return [] if ingredient_names.blank?

    prompt = <<~PROMPT
      以下のカクテル材料名を日本語に翻訳してください。
      各材料を改行で区切って、翻訳結果のみを返してください。
      順序は元のリストと同じにしてください。

      材料リスト:
      #{ingredient_names.join("\n")}
    PROMPT

    result = translate(prompt)
    result&.split("\n")&.map(&:strip) || []
  rescue StandardError => e
    Rails.logger.error("Batch translation failed: #{e.message}")
    []
  end

  private

  def translate(prompt)
    response = @client.chat(
      parameters: {
        model: 'gpt-4o-mini', # コスト効率の良いモデル
        messages: [
          { role: 'system', content: 'あなたは正確で自然な日本語翻訳を行う翻訳アシスタントです。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3, # 一貫性のある翻訳のため低めに設定
        max_tokens: 500
      }
    )

    response.dig('choices', 0, 'message', 'content')&.strip
  rescue StandardError => e
    # レート制限エラー（429）の場合、DeepLにフォールバック
    if e.message.include?('429') && @use_deepl_fallback
      Rails.logger.warn("OpenAI rate limit reached, falling back to DeepL")
      translate_with_deepl(extract_text_from_prompt(prompt))
    else
      Rails.logger.error("OpenAI API error: #{e.message}")
      raise TranslationError, "Translation API failed: #{e.message}"
    end
  end

  # プロンプトから翻訳対象のテキストを抽出
  def extract_text_from_prompt(prompt)
    # "カクテル名: Mojito" のような形式からテキストを抽出
    if prompt =~ /カクテル名:\s*(.+)$/
      $1.strip
    elsif prompt =~ /材料名:\s*(.+)$/
      $1.strip
    elsif prompt =~ /分量:\s*(.+)$/
      $1.strip
    elsif prompt =~ /グラス名:\s*(.+)$/
      $1.strip
    elsif prompt =~ /作り方:\s*(.+)$/m
      $1.strip
    elsif prompt =~ /材料リスト:\s*(.+)$/m
      $1.strip
    else
      prompt # フォールバック
    end
  end

  # DeepL APIで翻訳
  def translate_with_deepl(text)
    return nil if text.blank?

    uri = URI('https://api-free.deepl.com/v2/translate')
    params = {
      'auth_key' => @deepl_api_key,
      'text' => text,
      'target_lang' => 'JA',
      'source_lang' => 'EN'
    }

    response = Net::HTTP.post_form(uri, params)

    if response.is_a?(Net::HTTPSuccess)
      result = JSON.parse(response.body)
      result['translations']&.first&.dig('text')&.strip
    else
      Rails.logger.error("DeepL API error: #{response.code}")
      nil
    end
  rescue StandardError => e
    Rails.logger.error("DeepL translation failed: #{e.message}")
    nil
  end
end
