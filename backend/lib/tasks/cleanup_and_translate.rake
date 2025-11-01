# frozen_string_literal: true

namespace :cocktails do
  desc 'Keep only famous cocktails and translate to Japanese'
  task cleanup_and_translate: :environment do
    puts "Starting cleanup and translation..."

    cleaner = CocktailCleaner.new
    cleaner.cleanup_and_translate

    puts "\nCleanup and translation completed!"
  end
end

class CocktailCleaner
  # 有名なカクテルの日本語名辞書
  FAMOUS_COCKTAILS = {
    'Mojito' => 'モヒート',
    'Margarita' => 'マルガリータ',
    'Manhattan' => 'マンハッタン',
    'Martini' => 'マティーニ',
    'Cosmopolitan' => 'コスモポリタン',
    'Mai Tai' => 'マイタイ',
    'Daiquiri' => 'ダイキリ',
    'Negroni' => 'ネグローニ',
    'Old Fashioned' => 'オールドファッションド',
    'Whiskey Sour' => 'ウイスキーサワー',
    'Margarita' => 'マルガリータ',
    'Pina Colada' => 'ピニャコラーダ',
    'Long Island Iced Tea' => 'ロングアイランドアイスティー',
    'Moscow Mule' => 'モスコミュール',
    'Bloody Mary' => 'ブラッディマリー',
    'Sex on the Beach' => 'セックス・オン・ザ・ビーチ',
    'Tom Collins' => 'トムコリンズ',
    'Gin Fizz' => 'ジンフィズ',
    'Mint Julep' => 'ミントジュレップ',
    'Caipirinha' => 'カイピリーニャ',
    'Aperol Spritz' => 'アペロールスプリッツ',
    'Spritz' => 'スプリッツ',
    'Americano' => 'アメリカーノ',
    'Aviation' => 'アヴィエーション',
    'Bellini' => 'ベリーニ',
    'Bramble' => 'ブランブル',
    'Cuba Libre' => 'キューバリブレ',
    'Dark and Stormy' => 'ダークアンドストーミー',
    'Dirty Martini' => 'ダーティマティーニ',
    'Dry Martini' => 'ドライマティーニ',
    'Espresso Martini' => 'エスプレッソマティーニ',
    'French 75' => 'フレンチ75',
    'Gimlet' => 'ギムレット',
    'Godfather' => 'ゴッドファーザー',
    'Godmother' => 'ゴッドマザー',
    'Grasshopper' => 'グラスホッパー',
    'Greyhound' => 'グレイハウンド',
    'Harvey Wallbanger' => 'ハーベイウォールバンガー',
    'Hemingway Special' => 'ヘミングウェイスペシャル',
    'Irish Coffee' => 'アイリッシュコーヒー',
    'Kir' => 'キール',
    'Kir Royale' => 'キールロワイヤル',
    'Lemon Drop' => 'レモンドロップ',
    'Mimosa' => 'ミモザ',
    'Paloma' => 'パロマ',
    'Pisco Sour' => 'ピスコサワー',
    'Sazerac' => 'サゼラック',
    'Screwdriver' => 'スクリュードライバー',
    'Sea Breeze' => 'シーブリーズ',
    'Sidecar' => 'サイドカー',
    'Tequila Sunrise' => 'テキーラサンライズ',
    'Vesper' => 'ベスパー',
    'White Russian' => 'ホワイトロシアン',
    'Zombie' => 'ゾンビ',
    'B-52' => 'B-52',
    'Bloody Mary' => 'ブラッディマリー',
    'Porn Star Martini' => 'ポルノスターマティーニ',
    'Pornstar Martini' => 'ポルノスターマティーニ',
    'Rusty Nail' => 'ラスティネイル',
    'Singapore Sling' => 'シンガポールスリング',
    'Whisky Mac' => 'ウイスキーマック',
    'Alexander' => 'アレキサンダー',
    'Boulevardier' => 'ブルバルディエ',
    'Clover Club' => 'クローバークラブ',
    'Corpse Reviver' => 'コープスリバイバー',
    'Gin and Tonic' => 'ジントニック',
    'Gin Tonic' => 'ジントニック',
    'Jack Rose' => 'ジャックローズ',
    'Kir' => 'キール',
    'Last Word' => 'ラストワード',
    'The Last Word' => 'ラストワード',
    'Penicillin' => 'ペニシリン',
    'Ramos Gin Fizz' => 'ラモスジンフィズ',
    'Vieux Carré' => 'ヴュー・カレ',
    'Vodka Martini' => 'ウォッカマティーニ',
    'Vodka Tonic' => 'ウォッカトニック'
  }.freeze

  def initialize
    @kept_count = 0
    @deleted_count = 0
    @translated_count = 0
  end

  def cleanup_and_translate
    puts "\n1. Cleaning up non-famous cocktails..."
    cleanup_cocktails

    puts "\n2. Translating cocktail names..."
    translate_names

    puts "\n3. Translating recipes with OpenAI..."
    translate_recipes

    print_summary
  end

  private

  def cleanup_cocktails
    Cocktail.find_each do |cocktail|
      if FAMOUS_COCKTAILS.key?(cocktail.name)
        puts "  ✅ Keeping: #{cocktail.name}"
        @kept_count += 1
      else
        puts "  ❌ Deleting: #{cocktail.name}"
        cocktail.destroy
        @deleted_count += 1
      end
    end
  end

  def translate_names
    Cocktail.find_each do |cocktail|
      name_ja = FAMOUS_COCKTAILS[cocktail.name]
      if name_ja && cocktail.update(name_ja: name_ja)
        puts "  ✅ #{cocktail.name} → #{name_ja}"
        @translated_count += 1
      end
    end
  end

  def translate_recipes
    # OpenAI APIキーが設定されている場合のみ翻訳
    api_key = ENV['OPENAI_API_KEY']

    unless api_key
      puts "  ⚠️  OPENAI_API_KEY not set. Skipping recipe translation."
      puts "  💡 Set OPENAI_API_KEY environment variable to enable translation."
      return
    end

    translation_service = TranslationService.new
    translated = 0

    Cocktail.where.not(instructions: nil).find_each do |cocktail|
      next if cocktail.instructions.blank?

      begin
        # OpenAI APIで翻訳
        translated_text = translation_service.translate_instructions(cocktail.instructions)

        if translated_text.present?
          # instructionsは英語のまま、descriptionに日本語を保存
          cocktail.update(description: translated_text)
          puts "  ✅ Translated: #{cocktail.name}"
          translated += 1
          sleep 0.5 # API負荷軽減
        end
      rescue StandardError => e
        puts "  ❌ Error translating #{cocktail.name}: #{e.message}"
      end
    end

    puts "\n  Translated #{translated} recipes"
  end

  def print_summary
    puts "\n" + "=" * 50
    puts "Summary:"
    puts "  ✅ Kept: #{@kept_count} famous cocktails"
    puts "  ❌ Deleted: #{@deleted_count} cocktails"
    puts "  🌐 Translated: #{@translated_count} names"
    puts "=" * 50
    puts "\nFinal cocktail count: #{Cocktail.count}"
  end
end
