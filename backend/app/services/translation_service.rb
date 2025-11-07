# frozen_string_literal: true

# OpenAI APIを使用してカクテル関連のテキストを翻訳するサービス
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

  # 分量を日本人に馴染みのある単位に変換
  def translate_measure(measure)
    return nil if measure.blank?

    prompt = <<~PROMPT
      以下のカクテルレシピに含まれる分量表現を、日本人に馴染みやすい単位に変換してください。

      # 変換ルール
      - oz（オンス） → ml に変換（1 oz = 約30ml）
      - tsp（ティースプーン） → ml に変換（1 tsp = 約5ml）
      - tbsp（テーブルスプーン） → ml に変換（1 tbsp = 約15ml）
      - dash → 「1〜2滴」または「少々」
      - splash → 「10〜20ml程度」または「少量」
      - top / fill / to top → 「グラスを満たす程度」や「適量」
      - twist / slice / wedge / piece → 「◯切れ」や「◯枚」など自然な日本語に
      - 数値がない場合でも、文脈からおおよその量を推定して表現する（例: “splash of soda” → 「ソーダを少量」）
      - 既に ml、g、個、枚 などの日本の単位の場合はそのまま残す

      # 出力形式
      - 変換後の分量のみを返す（説明不要、単位を含む短い文字列）
      - 例)
        - "1 oz" → "30ml"
        - "1 tsp" → "5ml"
        - "dash of bitters" → "1〜2滴"
        - "fill with tonic" → "トニックを適量（グラスを満たす程度）"

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

      # 翻訳ルール
      - 日本の一般的なバーやカフェでも通じる表現に変換してください。
      - 日本人に馴染みがない場合は、近い形・用途の一般的なグラス名に意訳してください。
        - 例: "Old Fashioned Glass" → "ロックグラス"
        - 例: "Cordial Glass" → "リキュールグラス"
        - 例: "Coupe Glass" → "カクテルグラス"
        - 例: "Highball Glass" → "ハイボールグラス"
        - 例: "Collins Glass" → "タンブラー"
      - カタカナ・ひらがなの自然な表記にし、「グラス」「カップ」などは必要に応じて補って構いません。
      - 難しい専門用語（例: "Nick and Nora Glass"）は「カクテルグラス」など一般名詞に置き換えてください。
      - 翻訳結果のみを返してください（説明や注釈は不要です）。

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
      - 英語を直訳せず、自然な日本語の調理手順に言い換える
      - 「ステア」「シェイク」「ストレイン」などの専門用語は使わず、以下のように言い換える
        - shake → 「よくふる」
        - stir → 「かき混ぜる」
        - strain → 「注ぐ」または「こす」
        - garnish → 「飾る」または「添える」
        - build → 「グラスに直接入れる」
      - 「〜します」「〜を加えます」「〜に注ぎます」の語尾で統一
      - 手順番号がある場合は保持し、なければ2〜3文で自然にまとめる
      - 測定単位や材料名は翻訳しない（別処理のため）
      - 翻訳結果のみを返し、説明や注釈は不要
    RULES

    examples = <<~EXAMPLES
      # 翻訳例
      英文: Shake with ice and strain into a chilled glass.
      出力: 氷を入れてよくふり、冷やしたグラスに注ぎます。

      英文: Stir all ingredients with ice and strain into an old fashioned glass.
      出力: 氷と材料をグラスでかき混ぜ、新しい氷を入れたグラスに注ぎます。

      英文: Add all ingredients to a shaker with ice and shake well.
      出力: シェーカーに氷と材料を入れ、よくふります。

      英文: Build all ingredients in a highball glass and top with soda.
      出力: ハイボールグラスに材料を入れ、ソーダを注いで満たします。

      # 翻訳対象
      #{instructions}
    EXAMPLES

    prompt = build_prompt('日本人が読みやすい自然なレシピ文体に翻訳', examples, rules: rules)

    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for instructions: #{e.message}")
    nil
  end

  # カクテルの説明文を生成
  def generate_description(cocktail_name, base, strength, ingredients_list)
    return nil if cocktail_name.blank?

    prompt = <<~PROMPT
      あなたはカクテル文化に詳しいプロのライターです。
      以下の条件に従って、指定されたカクテルの紹介文を日本語で書いてください。

      # 条件
      - 文字数はおよそ100文字前後
      - 歴史的背景、語源、見た目や味の特徴を1文程度で紹介する
      - 飲むシーン（例：夜風を感じながらゆったり過ごす時間にぴったり）を1文で添える
      - トーンは上品で少し文学的。説明ではなく情景が浮かぶように。
      - 主語はなるべく省き、三人称・客観的な描写で。

      # 出力フォーマット
      カクテル名
      本文（100文字前後）

      # 入力例
      カクテル名: ソルティドッグ

      # 出力例
      ソルティドッグ
      「甲板員」をあらわすイギリスのスラングが名前となっており、潮風や海水を浴びて作業する彼らをイメージしてか、グラスのふちに塩をつけたスノースタイルが特徴。塩をなめながら飲むことで、グレープフルーツの酸味をやわらげ、甘みが増す。夕暮れ時に一息つきたいときに。

      # 実行対象
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

  # カクテルのベース（主原料）を判定
  def determine_base(ingredients_list)
    return 'vodka' if ingredients_list.blank?

    prompt = <<~PROMPT
      You are a cocktail expert. Based on the following ingredient list, determine the base spirit of this cocktail.

      Ingredients: #{ingredients_list.join(', ')}

      Return ONLY ONE of these exact words (nothing else):
      gin
      rum
      whisky
      vodka
      tequila
      wine
      beer

      Rules:
      - If the list contains any type of rum (light rum, dark rum, white rum, etc.), return: rum
      - If the list contains gin, return: gin
      - If the list contains whiskey/whisky/bourbon/rye, return: whisky
      - If the list contains vodka, return: vodka
      - If the list contains tequila/mezcal, return: tequila
      - If the list contains champagne/prosecco/sparkling wine/wine/aperol, return: wine
      - If the list contains beer, return: beer
      - If multiple spirits are present, choose the primary one (usually the first or most prominent)

      Your response (one word only):
    PROMPT

    result = translate(prompt)&.strip&.downcase

    # 有効な値のみを返す
    valid_bases = %w[gin rum whisky vodka tequila wine beer]
    valid_bases.include?(result) ? result : 'vodka'
  rescue StandardError => e
    Rails.logger.error("Base determination failed: #{e.message}")
    'vodka'
  end

  # カクテルの強度を判定
  def determine_strength(ingredients_list, alcoholic_type)
    return 'light' if alcoholic_type == 'Non alcoholic'
    return 'light' if ingredients_list.blank?

    prompt = <<~PROMPT
      あなたはプロのバーテンダーです。
      以下のカクテル情報（一般的なレシピを想定）からアルコールの強さを体感・度数・印象の観点で分類してください。

      材料: #{ingredients_list.join(', ')}
      Alcoholic: #{alcoholic_type}

      # 分類基準
      - light: 低アルコールまたはジュース・ソーダなどで割られており飲みやすい（例: カシスオレンジ、スプリッツァー、ピーチフィズ）
      - medium: 標準的なカクテル。スピリッツ主体だが果汁やリキュールでバランス（例: モスコミュール、マルガリータ、ジントニック）
      - strong: スピリッツが主成分で度数が高く、刺激的・重厚な印象（例: マティーニ、ネグローニ、マンハッタン）

      light / medium / strong のいずれか1語のみを返してください。
    PROMPT

    result = translate(prompt)&.strip&.downcase

    # 有効な値のみを返す
    valid_strengths = %w[light medium strong]
    valid_strengths.include?(result) ? result : 'medium'
  rescue StandardError => e
    Rails.logger.error("Strength determination failed: #{e.message}")
    'medium'
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

  def build_prompt(task_name, content, rules: nil)
    sections = []
    sections << "以下の内容を#{task_name}してください。"
    sections << "# 翻訳ルール\n#{rules.rstrip}" if rules.present?
    sections << content.rstrip if content.present?
    sections.join("\n\n")
  end

  def translate(prompt)
    response = @client.chat(
      parameters: {
        model: 'gpt-5',
        messages: [
          { role: 'system', content: 'あなたはカクテル分野に精通した、正確で自然な日本語翻訳を行う翻訳アシスタントです。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.15,
        max_tokens: 500
      }
    )

    response.dig('choices', 0, 'message', 'content')&.strip
  rescue StandardError => e
    Rails.logger.error("OpenAI API error: #{e.message}")
    raise TranslationError, "Translation API failed: #{e.message}"
  end
end
