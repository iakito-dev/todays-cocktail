# frozen_string_literal: true

# OpenAI Responses API (GPT-5) を使用してカクテル関連のテキストを翻訳するサービス
class TranslationService
  class TranslationError < StandardError; end

  def initialize
    @client = OpenAI::Client.new(access_token: ENV.fetch("OPENAI_API_KEY"))
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
      以下のカクテルレシピに含まれる分量表現を、日本人に馴染みやすい単位に変換してください。

      # 変換ルール
      - **oz（オンス）** → ml に変換（1 oz = 約30ml）
      - **tsp（ティースプーン）** → ml に変換（1 tsp = 約5ml）
      - **tbsp（テーブルスプーン）** → ml に変換（1 tbsp = 約15ml）
      - **dash** → 「1〜2滴」または「少々」
      - **splash** → 「10〜20ml程度」または「少量」
      - **top / fill / to top** → 「グラスを満たす程度」や「適量」
      - **twist / slice / wedge / piece** → 「◯切れ」や「◯枚」など自然な日本語に
      - **数値がない場合でも、文脈からおおよその量を推定して表現する**
        - 例: “splash of soda” → 「ソーダを少量」
        - 例: “fill with tonic” → 「トニックを適量（グラスを満たす程度）」
      - 既にml、g、個、枚などの日本の単位の場合はそのまま残す。

      # 出力形式
      - 変換後の分量のみを返す（説明不要、単位を含む短い文字列）
      - 例:
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
      - カタカナ・ひらがなで自然な表記にし、「グラス」「カップ」などは必要に応じて補って構いません。
      - 難しい専門用語（例: “Nick and Nora Glass”）は「カクテルグラス」など一般名詞に置き換えてください。
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

    prompt = build_prompt("\u65E5\u672C\u8A9E\u306E\u81EA\u7136\u306A\u30AB\u30AF\u30C6\u30EB\u624B\u9806\u306B\u7FFB\u8A33", examples, rules: rules)
    translate(prompt)
  rescue StandardError => e
    Rails.logger.error("Translation failed for instructions: #{e.message}")
    nil
  end

  # カクテル説明文を生成
  def generate_description(cocktail_name, base, strength, ingredients_list)
    return nil if cocktail_name.blank?

    prompt = <<~PROMPT
      あなたはカクテル文化に詳しいプロのライターです。
      以下の条件に従って、指定されたカクテルの紹介文を日本語で書いてください。

      # 条件
      - 文字数はおよそ120文字前後
      - カクテルの由来や語源、または発祥地を1文で触れる
      - 味わいや香り、見た目の特徴を1文で伝える
      - 飲むシーンを1文で添える（例：「穏やかな夕暮れに」「休日の昼下がりに」など）
      - 専門誌やバーのメニューに載るような、わかりやすく洗練された文章に
      - 味や香り、印象を中心に描写する（例：「爽やか」「香り高い」「心地よい余韻」など）
      - 比喩は控えめに1つまでとし、情景をさりげなく添える程度にする
      - 主語は省き、客観的・説明調すぎない自然な語り口にする
      - **出力にはカクテル名は含めず、説明文のみを返す。** 冒頭に改行や見出しを入れない。

      # 出力フォーマット
      本文（120文字前後）

      # 入力例
      カクテル名: ソルティドッグ

      # 出力例1
      海辺で愛される爽快なカクテル。グレープフルーツジュースのほろ苦さと塩のアクセントが絶妙に調和し、すっきりとした味わいが特徴。夏の暑い日にリフレッシュしたいときに。

      # 出力例2
      「塩まみれの犬」という名を持つユニークなカクテル。グレープフルーツのほろ苦さと塩のコントラストが絶妙で、すっきりとした後味が魅力。海辺のバーでゆったり飲みたい一杯。

      # 出力例3
      名の由来は海の男を指すスラング。グレープフルーツの酸味に塩のアクセントが重なり、爽やかでキリッとした味わい。仕事終わりに気分をリセットしたいときに。

  # 入力例
  カクテル名: モヒート

      # 出力例1
      キューバ・ハバナ発祥の伝統的なカクテル。名前はスペイン語の「mojo（香味）」に由来し、ライムとミントの爽やかな香りが広がる。暑い午後にすっきりと気分を整えたいときに。

      # 出力例2
      キューバ生まれのクラシックなカクテル。ミントとライムの清涼感が際立ち、砂糖のやわらかな甘みが心地よく調和する。夏の夜にリゾート気分を味わいたいときに。

      # 出力例3
      名の由来は「魔法の薬」を意味するスペイン語「mojo」。ミントの香りとライムの酸味が織りなす爽快な味わいが魅力。日差しの強い昼下がりにぴったりの一杯。

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

  # カクテルのベース判定
  def determine_base(ingredients_list)
    return "vodka" if ingredients_list.blank?

    prompt = <<~PROMPT
      You are a cocktail expert. From the ingredient list, return only one of:
      gin, rum, whisky, vodka, tequila, wine, beer.

      Ingredients: #{ingredients_list.join(', ')}
    PROMPT

    result = translate(prompt)&.strip&.downcase
    %w[gin rum whisky vodka tequila wine beer].include?(result) ? result : "vodka"
  rescue StandardError => e
    Rails.logger.error("Base determination failed: #{e.message}")
    "vodka"
  end

  # カクテルの強度判定
  def determine_strength(cocktail_name, ingredients_list = [], alcoholic_type = nil)
    return "light" if alcoholic_type == "Non alcoholic"

    prompt = <<~PROMPT
      あなたはプロのバーテンダーです。
      以下のカクテル名から、一般的なレシピに基づいてアルコールの強さ（体感・度数・印象）を分類してください。

      # 出力仕様
      次のJSON形式で出力してください。

      {
        "name": "カクテル名",
        "intensity": "ライト | ミディアム | ストロング",
        "reason": "判定理由（どのような特徴からそう判断したかを1文で説明）"
      }

      # 分類基準
      - **ライト**：低アルコールまたはジュース・ソーダなどで割られており、飲みやすい。
      - **ミディアム**：標準的なカクテル。スピリッツ主体だが果汁やリキュールでバランスが取れている。
      - **ストロング**：スピリッツが主成分で度数が高く、刺激的または重厚な印象。

      # 実行対象
      カクテル名: #{cocktail_name}
      参考材料: #{ingredients_list.any? ? ingredients_list.join(', ') : '情報なし'}
    PROMPT

    raw = translate(prompt)
    return nil if raw.blank?

    data = JSON.parse(raw) rescue nil
    return nil unless data.is_a?(Hash)

    intensity = data["intensity"]&.strip
    mapped = case intensity
    when "\u30E9\u30A4\u30C8", "light" then "light"
    when "\u30DF\u30C7\u30A3\u30A2\u30E0", "medium" then "medium"
    when "\u30B9\u30C8\u30ED\u30F3\u30B0", "strong" then "strong"
    end

    mapped || "medium"
  rescue StandardError => e
    Rails.logger.error("Strength determination failed for '#{cocktail_name}': #{e.message}")
    "medium"
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
        model: "gpt-5",
        input: prompt,
        reasoning: { effort: "minimal" },
        text: { verbosity: "low" },
        max_output_tokens: 800
      }
    )
    extract_output_text(response)
  rescue StandardError => e
    Rails.logger.error("OpenAI API error: #{e.message}")
    raise TranslationError, "Translation API failed: #{e.message}"
  end

  def extract_output_text(response)
    return response unless response.is_a?(Hash)

    if response["output_text"].present?
      return Array(response["output_text"]).join("\n").strip
    end

    if response["output"].is_a?(Array)
      combined = response["output"].filter_map do |item|
        next unless item["content"].is_a?(Array)

        texts = item["content"].filter_map do |content|
          content["text"] if content["type"] == "output_text"
        end
        texts.join
      end

      combined_text = combined.reject(&:blank?).join("\n").strip
      return combined_text if combined_text.present?
    end

    # Fallback for backwards compatibility (e.g., Chat Completions API shape)
    response.dig("choices", 0, "message", "content")&.strip
  end
end
