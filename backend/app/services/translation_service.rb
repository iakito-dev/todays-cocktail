# frozen_string_literal: true

# OpenAI Responses API (GPT-5) を使用してカクテル関連のテキストを翻訳するサービス
class TranslationService
  class TranslationError < StandardError; end

  def initialize
    @client = OpenAI::Client.new(access_token: ENV.fetch('OPENAI_API_KEY'))
  end

  # カクテル名を翻訳
  def translate_cocktail_name(name)
    return nil if name.blank?

    prompt = <<~PROMPT
      以下のカクテル名を日本語に翻訳してください。
      一般的なカクテル名はカタカナで、固有名詞的な場合はそのままカタカナ転写してください。
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
      一般的な材料名（例: Gin → ジン）はカタカナで、説明的な材料（例: Fresh lime juice → 新鮮なライムジュース）は自然な日本語に。
      翻訳結果のみを返してください（説明は不要です）。

      材料名: #{name}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for ingredient '#{name}': #{e.message}")
    nil
  end

  # 分量を日本人に馴染みのある単位に変換
  def translate_measure(measure)
    return nil if measure.blank?

    prompt = <<~PROMPT
      以下のカクテル分量表現を日本人に馴染みやすい単位に変換してください。

      - oz → ml（1 oz = 約30ml）
      - tsp → 5ml
      - tbsp → 15ml
      - dash → 「1〜2滴」
      - splash → 「10〜20ml程度」
      - top / fill → 「グラスを満たす程度」
      - twist / slice / wedge → 「◯切れ」など自然な日本語
      - 既にmlや個などの単位がある場合はそのまま
      - 出力は変換後の短い文字列のみ

      元の分量: #{measure}
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
      以下のカクテル用グラス名を日本語に翻訳してください。
      日本のバーやカフェで一般的に使われる名称に変換し、自然なカタカナ表記にしてください。
      翻訳結果のみを返してください。

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

    rules = <<~RULES
      - 英語を自然な日本語の調理手順に意訳する
      - shake → 「よくふる」
      - stir → 「かき混ぜる」
      - strain → 「注ぐ」
      - garnish → 「飾る」
      - build → 「グラスに直接入れる」
      - 「〜します」で統一
      - 翻訳結果のみ出力
    RULES

    examples = <<~EXAMPLES
      英文: Shake with ice and strain into a chilled glass.
      出力: 氷を入れてよくふり、冷やしたグラスに注ぎます。

      英文: Stir all ingredients with ice and strain into an old fashioned glass.
      出力: 氷と材料をかき混ぜ、新しい氷を入れたグラスに注ぎます。

      翻訳対象:
      #{instructions}
    EXAMPLES

    prompt = build_prompt('日本語の自然なカクテル手順に翻訳', examples, rules: rules)
    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for instructions: #{e.message}")
    nil
  end

  # カクテル説明文を生成
  def generate_description(cocktail_name, base, strength, ingredients_list)
    return nil if cocktail_name.blank?

    prompt = <<~PROMPT
      あなたはカクテル文化に詳しいライターです。
      以下の条件に従って、指定されたカクテルの紹介文を日本語で100文字前後で書いてください。

      - 歴史や由来、味や香りの特徴を簡潔に述べる
      - 飲むシーンを1文で添える
      - 上品で情景が浮かぶ文体にする
      - 出力は「カクテル名」「本文」の2行のみ

      カクテル名: #{cocktail_name}
      ベース: #{base.presence || '不明'}
      強度: #{strength.presence || '不明'}
      材料: #{ingredients_list.any? ? ingredients_list.join(', ') : '情報なし'}
    PROMPT

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Description generation failed for '#{cocktail_name}': #{e.message}")
    nil
  end

  # カクテルのベース判定
  def determine_base(ingredients_list)
    return 'vodka' if ingredients_list.blank?

    prompt = <<~PROMPT
      You are a cocktail expert. From the ingredient list, return only one of:
      gin, rum, whisky, vodka, tequila, wine, beer.

      Ingredients: #{ingredients_list.join(', ')}
    PROMPT

    result = translate(prompt)&.strip&.downcase
    %w[gin rum whisky vodka tequila wine beer].include?(result) ? result : 'vodka'
  rescue StandardError => e
    Rails.logger.error("Base determination failed: #{e.message}")
    'vodka'
  end

  # カクテルの強度判定
  def determine_strength(ingredients_list, alcoholic_type)
    return 'light' if alcoholic_type == 'Non alcoholic'
    return 'light' if ingredients_list.blank?

    prompt = <<~PROMPT
      あなたはバーテンダーです。
      以下の材料から、カクテルのアルコール強度を light / medium / strong のいずれかで判定してください。

      材料: #{ingredients_list.join(', ')}
      Alcoholic: #{alcoholic_type}
    PROMPT

    result = translate(prompt)&.strip&.downcase
    %w[light medium strong].include?(result) ? result : 'medium'
  rescue StandardError => e
    Rails.logger.error("Strength determination failed: #{e.message}")
    'medium'
  end

  # バッチ翻訳
  def translate_ingredients_batch(ingredient_names)
    return [] if ingredient_names.blank?

    prompt = <<~PROMPT
      以下のカクテル材料名を日本語に翻訳してください。
      各行ごとに翻訳結果のみを返してください。

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

  def build_prompt(task_name, content, rules: nil)
    [ "以下の内容を#{task_name}してください。",
      ("# 翻訳ルール\n#{rules}" if rules),
      content
    ].compact.join("\n\n")
  end

  # GPT-5対応のResponses API呼び出し
  def translate(prompt)
    response = @client.responses.create(
      parameters: {
        model: 'gpt-5',
        input: prompt,
        reasoning: { effort: 'medium' },
        text: { verbosity: 'low' },
        max_output_tokens: 500
      }
    )
    response.output_text.strip
  rescue StandardError => e
    Rails.logger.error("OpenAI API error: #{e.message}")
    raise TranslationError, "Translation API failed: #{e.message}"
  end
end
