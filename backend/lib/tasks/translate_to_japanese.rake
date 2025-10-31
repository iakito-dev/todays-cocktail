# frozen_string_literal: true

namespace :cocktails do
  desc 'Translate cocktail data to Japanese'
  task translate: :environment do
    puts "Starting translation and conversion..."

    translator = JapaneseTranslator.new
    translator.translate_all

    puts "\nTranslation completed!"
  end
end

class JapaneseTranslator
  # グラス名の日本語マッピング
  GLASS_TRANSLATIONS = {
    'Cocktail glass' => 'カクテルグラス',
    'Highball glass' => 'ハイボールグラス',
    'Old-fashioned glass' => 'オールドファッションドグラス',
    'Collins glass' => 'コリンズグラス',
    'Hurricane glass' => 'ハリケーングラス',
    'Champagne flute' => 'シャンパングラス',
    'Margarita/Coupette glass' => 'マルガリータグラス',
    'White wine glass' => '白ワイングラス',
    'Red wine glass' => '赤ワイングラス',
    'Wine Glass' => 'ワイングラス',
    'Shot glass' => 'ショットグラス',
    'Coffee mug' => 'コーヒーマグ',
    'Beer mug' => 'ビールジョッキ',
    'Beer Glass' => 'ビールグラス',
    'Pint glass' => 'パイントグラス',
    'Copper Mug' => '銅製マグカップ',
    'Martini Glass' => 'マティーニグラス',
    'Margarita glass' => 'マルガリータグラス',
    'Whiskey sour glass' => 'ウイスキーサワーグラス',
    'Brandy snifter' => 'ブランデーグラス',
    'Champagne tulip' => 'シャンパンチューリップ',
    'Cordial glass' => 'コーディアルグラス',
    'Punch bowl' => 'パンチボウル',
    'Jar' => 'ジャー',
    'Mason jar' => 'メイソンジャー',
    'Coupe Glass' => 'クープグラス',
    'Nick and Nora Glass' => 'ニック&ノーラグラス',
    'Balloon Glass' => 'バルーングラス',
    'Pitcher' => 'ピッチャー',
    'Irish coffee cup' => 'アイリッシュコーヒーカップ',
    'Parfait glass' => 'パフェグラス'
  }.freeze

  # 一般的な材料名の日本語マッピング
  INGREDIENT_TRANSLATIONS = {
    'Vodka' => 'ウォッカ',
    'Gin' => 'ジン',
    'Rum' => 'ラム',
    'Light rum' => 'ライトラム',
    'Dark rum' => 'ダークラム',
    'White rum' => 'ホワイトラム',
    'Tequila' => 'テキーラ',
    'Whiskey' => 'ウイスキー',
    'Whisky' => 'ウイスキー',
    'Bourbon' => 'バーボン',
    'Scotch' => 'スコッチ',
    'Brandy' => 'ブランデー',
    'Cognac' => 'コニャック',
    'Vermouth' => 'ベルモット',
    'Sweet Vermouth' => 'スイートベルモット',
    'Dry Vermouth' => 'ドライベルモット',
    'Triple sec' => 'トリプルセック',
    'Cointreau' => 'コアントロー',
    'Kahlua' => 'カルーア',
    'Baileys irish cream' => 'ベイリーズ',
    'Amaretto' => 'アマレット',
    'Campari' => 'カンパリ',
    'Aperol' => 'アペロール',
    'Champagne' => 'シャンパン',
    'Prosecco' => 'プロセッコ',
    'Wine' => 'ワイン',
    'Red wine' => '赤ワイン',
    'White wine' => '白ワイン',
    'Beer' => 'ビール',
    'Lemon juice' => 'レモンジュース',
    'Lime juice' => 'ライムジュース',
    'Orange juice' => 'オレンジジュース',
    'Cranberry juice' => 'クランベリージュース',
    'Pineapple juice' => 'パイナップルジュース',
    'Tomato juice' => 'トマトジュース',
    'Grapefruit juice' => 'グレープフルーツジュース',
    'Apple juice' => 'アップルジュース',
    'Lemon' => 'レモン',
    'Lime' => 'ライム',
    'Orange' => 'オレンジ',
    'Sugar' => '砂糖',
    'Sugar syrup' => 'シュガーシロップ',
    'Simple syrup' => 'シンプルシロップ',
    'Grenadine' => 'グレナデンシロップ',
    'Honey' => 'はちみつ',
    'Mint' => 'ミント',
    'Bitters' => 'ビターズ',
    'Angostura bitters' => 'アンゴスチュラビターズ',
    'Soda water' => 'ソーダ水',
    'Tonic water' => 'トニックウォーター',
    'Ginger ale' => 'ジンジャーエール',
    'Ginger beer' => 'ジンジャービア',
    'Club soda' => 'クラブソーダ',
    'Cola' => 'コーラ',
    'Coffee' => 'コーヒー',
    'Espresso' => 'エスプレッソ',
    'Cream' => '生クリーム',
    'Heavy cream' => '生クリーム',
    'Milk' => '牛乳',
    'Coconut cream' => 'ココナッツクリーム',
    'Coconut milk' => 'ココナッツミルク',
    'Egg white' => '卵白',
    'Egg yolk' => '卵黄',
    'Egg' => '卵',
    'Ice' => '氷',
    'Salt' => '塩',
    'Pepper' => 'コショウ',
    'Tabasco sauce' => 'タバスコ',
    'Worcestershire sauce' => 'ウスターソース',
    'Maraschino cherry' => 'マラスキーノチェリー',
    'Cherry' => 'チェリー',
    'Olive' => 'オリーブ',
    'Celery salt' => 'セロリソルト',
    'Water' => '水',
    'Hot water' => 'お湯'
  }.freeze

  def initialize
    @updated_count = 0
  end

  def translate_all
    translate_glasses
    translate_ingredients
    translate_amounts

    puts "\n" + "=" * 50
    puts "Translation Summary:"
    puts "  Updated: #{@updated_count} records"
    puts "=" * 50
  end

  private

  def translate_glasses
    puts "\nTranslating glass names..."

    Cocktail.find_each do |cocktail|
      next if cocktail.glass.blank?

      glass_ja = GLASS_TRANSLATIONS[cocktail.glass] || cocktail.glass

      if cocktail.update(glass_ja: glass_ja)
        @updated_count += 1
      end
    end

    puts "  ✅ Translated #{Cocktail.where.not(glass_ja: nil).count} glass names"
  end

  def translate_ingredients
    puts "\nTranslating ingredient names..."

    api_key = ENV['DEEPL_API_KEY']
    has_api_key = api_key.present?

    unless has_api_key
      puts "  ⚠️  DEEPL_API_KEY not set. Using dictionary only."
    end

    Ingredient.find_each do |ingredient|
      # 既に日本語訳がある場合はスキップ
      next if ingredient.name_ja.present? && ingredient.name != ingredient.name_ja

      # まず辞書で確認
      name_ja = INGREDIENT_TRANSLATIONS[ingredient.name]

      # 辞書になく、APIキーがある場合はDeepLで翻訳
      if name_ja.nil? && has_api_key
        name_ja = translate_with_deepl(ingredient.name, api_key)
        puts "  🌐 #{ingredient.name} -> #{name_ja}" if name_ja
        sleep 0.3 if name_ja # API負荷軽減
      end

      # それでもなければ英語のまま
      name_ja ||= ingredient.name

      if ingredient.update(name_ja: name_ja)
        @updated_count += 1
      end
    end

    puts "  ✅ Translated #{Ingredient.count} ingredient names"
  end

  def translate_with_deepl(text, api_key)
    require 'net/http'
    require 'json'
    require 'uri'

    uri = URI('https://api-free.deepl.com/v2/translate')
    params = {
      'auth_key' => api_key,
      'text' => text,
      'target_lang' => 'JA',
      'source_lang' => 'EN'
    }

    response = Net::HTTP.post_form(uri, params)

    if response.is_a?(Net::HTTPSuccess)
      result = JSON.parse(response.body)
      translated = result['translations']&.first&.dig('text')
      return translated if translated
    end

    nil
  rescue StandardError => e
    puts "    ⚠️  Translation error for '#{text}': #{e.message}"
    nil
  end

  def translate_amounts
    puts "\nConverting amounts to Japanese units..."

    CocktailIngredient.find_each do |ci|
      next if ci.amount_text.blank?

      amount_ja = convert_amount_to_japanese(ci.amount_text)

      if ci.update(amount_ja: amount_ja)
        @updated_count += 1
      end
    end

    puts "  ✅ Converted #{CocktailIngredient.where.not(amount_ja: nil).count} amounts"
  end

  def convert_amount_to_japanese(amount)
    return '適量' if amount == '適量'

    text = amount.strip

    # 分数とozの組み合わせを先に処理 (例: "1 1/2 oz" や "1/2 oz")
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)\s*oz/i) do |match|
      whole = $1.to_f
      numerator = $2.to_f
      denominator = $3.to_f
      total_oz = whole + (numerator / denominator)
      ml = (total_oz * 30).round
      "#{ml}ml"
    end

    text = text.gsub(/(\d+)\/(\d+)\s*oz/i) do |match|
      numerator = $1.to_f
      denominator = $2.to_f
      oz = numerator / denominator
      ml = (oz * 30).round
      "#{ml}ml"
    end

    # oz (オンス) を ml に変換 (1 oz = 30ml)
    text = text.gsub(/(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*oz/i) do |match|
      value = $1
      if value.include?('-')
        # 範囲の場合
        min, max = value.split('-').map(&:strip).map(&:to_f)
        "#{(min * 30).round}-#{(max * 30).round}ml"
      else
        ml = (value.to_f * 30).round
        "#{ml}ml"
      end
    end

    # tsp (ティースプーン) を ml に変換 (1 tsp = 5ml)
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)\s*tsps?/i) do |match|
      whole = $1.to_f
      numerator = $2.to_f
      denominator = $3.to_f
      total_tsp = whole + (numerator / denominator)
      ml = (total_tsp * 5).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    text = text.gsub(/(\d+)\/(\d+)\s*tsps?/i) do |match|
      numerator = $1.to_f
      denominator = $2.to_f
      tsp = numerator / denominator
      ml = (tsp * 5).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    text = text.gsub(/(\d+(?:\.\d+)?)\s*tsps?/i) do |match|
      ml = ($1.to_f * 5).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    # tbsp/tblsp (テーブルスプーン) を ml に変換 (1 tbsp = 15ml)
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)\s*t(?:a)?blsps?/i) do |match|
      whole = $1.to_f
      numerator = $2.to_f
      denominator = $3.to_f
      total_tbsp = whole + (numerator / denominator)
      ml = (total_tbsp * 15).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    text = text.gsub(/(\d+)\/(\d+)\s*t(?:a)?blsps?/i) do |match|
      numerator = $1.to_f
      denominator = $2.to_f
      tbsp = numerator / denominator
      ml = (tbsp * 15).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    text = text.gsub(/(\d+(?:\.\d+)?)\s*t(?:a)?blsps?/i) do |match|
      ml = ($1.to_f * 15).round(1)
      ml = ml.to_i if ml == ml.to_i
      "#{ml}ml"
    end

    # cl (センチリットル) を ml に変換 (1 cl = 10ml)
    text = text.gsub(/(\d+(?:\.\d+)?)\s*cl/i) do |match|
      ml = ($1.to_f * 10).round
      "#{ml}ml"
    end

    # 分数とshotの組み合わせを先に処理 (例: "1 1/2 shot" や "1/2 shot")
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)\s*shots?/i) do |match|
      whole = $1.to_f
      numerator = $2.to_f
      denominator = $3.to_f
      total_shots = whole + (numerator / denominator)
      ml = (total_shots * 30).round
      "#{ml}ml"
    end

    text = text.gsub(/(\d+)\/(\d+)\s*shots?/i) do |match|
      numerator = $1.to_f
      denominator = $2.to_f
      shots = numerator / denominator
      ml = (shots * 30).round
      "#{ml}ml"
    end

    # shot (ショット) を ml に変換 (1 shot = 30ml)
    text = text.gsub(/(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*shots?/i) do |match|
      value = $1
      if value.include?('-')
        # 範囲の場合
        min, max = value.split('-').map(&:strip).map(&:to_f)
        "#{(min * 30).round}-#{(max * 30).round}ml"
      else
        ml = (value.to_f * 30).round
        "#{ml}ml"
      end
    end

    # jigger (ジガー) を ml に変換 (1 jigger = 45ml)
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)\s*jiggers?/i) do |match|
      whole = $1.to_f
      numerator = $2.to_f
      denominator = $3.to_f
      total_jiggers = whole + (numerator / denominator)
      ml = (total_jiggers * 45).round
      "#{ml}ml"
    end

    text = text.gsub(/(\d+)\/(\d+)\s*jiggers?/i) do |match|
      numerator = $1.to_f
      denominator = $2.to_f
      jiggers = numerator / denominator
      ml = (jiggers * 45).round
      "#{ml}ml"
    end

    text = text.gsub(/(\d+(?:\.\d+)?)\s*jiggers?/i) do |match|
      ml = ($1.to_f * 45).round
      "#{ml}ml"
    end

    # 残った分数を処理 (単位なし)
    text = text.gsub(/(\d+)\s+(\d+)\/(\d+)/) do |match|
      whole = $1
      numerator = $2
      denominator = $3
      "#{whole} #{numerator}/#{denominator}"
    end

    text = text.gsub(/(\d+)\/(\d+)/) do |match|
      "#{$1}/#{$2}"
    end

    # 単位の翻訳
    text = text.gsub(/(\d+)\s*cups?/i, '\1カップ')
    text = text.gsub(/\bcup\b/i, 'カップ')
    text = text.gsub(/\bpint\b/i, 'パイント')
    text = text.gsub(/\bgallon\b/i, 'ガロン')
    text = text.gsub(/\bquart\b/i, 'クォート')
    text = text.gsub(/(\d+)\s*dash(?:es)?\b/i, '\1ダッシュ')
    text = text.gsub(/\bdash(?:es)?\b/i, 'ダッシュ')
    text = text.gsub(/(\d+)\s*splash(?:es)?\b/i, '\1スプラッシュ')
    text = text.gsub(/\bsplash(?:es)?\b/i, 'スプラッシュ')

    # よくあるフレーズ（「fill」や「top up」の前に処理）
    text = text.gsub(/\bJuice of\s+(\d+)\b/i, '\1個分')
    text = text.gsub(/\b(?:Fill|Top(?:\s+up)?)\s+with\b/i, '満たす')
    text = text.gsub(/\bto taste\b/i, '適量')
    text = text.gsub(/\bfresh\b/i, 'フレッシュ')
    text = text.gsub(/\bdried\b/i, '乾燥')
    text = text.gsub(/\bground\b/i, '粉末')
    text = text.gsub(/\bleaves?\b/i, '葉')
    text = text.gsub(/\bsprig\b/i, '枝')
    text = text.gsub(/\bslice\b/i, 'スライス')
    text = text.gsub(/\bwedge\b/i, 'くし切り')
    text = text.gsub(/\btwist\b/i, 'ツイスト')
    text = text.gsub(/(\d+)\s*-\s*(\d+)$/, '\1〜\2個')

    # 最後に、単位のない数字だけの場合は「個」を追加
    text = text.gsub(/^(\d+)$/, '\1個')

    text.strip
  end
end
