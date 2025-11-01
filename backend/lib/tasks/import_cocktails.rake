# frozen_string_literal: true

require 'net/http'
require 'json'

namespace :cocktails do
  desc 'Import cocktails from TheCocktailDB API'
  task import: :environment do
    puts "Starting cocktail import from TheCocktailDB..."

    importer = CocktailImporter.new
    importer.import_all

    puts "\nImport completed!"
    puts "Total cocktails: #{Cocktail.count}"
    puts "Total ingredients: #{Ingredient.count}"
  end

  desc 'Import cocktails by letter (usage: rake cocktails:import_by_letter[a])'
  task :import_by_letter, [:letter] => :environment do |t, args|
    letter = args[:letter] || 'a'
    puts "Importing cocktails starting with '#{letter}'..."

    importer = CocktailImporter.new
    importer.import_by_letter(letter)

    puts "\nImport completed for letter '#{letter}'!"
  end

  desc 'Import a specific cocktail by name (usage: rake cocktails:import_by_name["Margarita"])'
  task :import_by_name, [:name] => :environment do |t, args|
    name = args[:name]
    puts "Searching for cocktail: #{name}..."

    importer = CocktailImporter.new
    importer.import_by_name(name)

    puts "\nImport completed!"
  end
end

class CocktailImporter
  BASE_URL = 'https://www.thecocktaildb.com/api/json/v1/1'

  def initialize
    @imported_count = 0
    @skipped_count = 0
    @error_count = 0
    @translation_service = TranslationService.new
  end

  # すべてのアルファベットでカクテルをインポート
  def import_all
    ('a'..'z').each do |letter|
      import_by_letter(letter)
      sleep 0.5 # API負荷軽減のため
    end

    print_summary
  end

  # 特定の文字で始まるカクテルをインポート
  def import_by_letter(letter)
    url = URI("#{BASE_URL}/search.php?f=#{letter}")
    response = fetch_data(url)

    return unless response && response['drinks']

    response['drinks'].each do |drink_data|
      import_cocktail(drink_data)
    end
  end

  # 名前で検索してインポート
  def import_by_name(name)
    url = URI("#{BASE_URL}/search.php?s=#{URI.encode_www_form_component(name)}")
    response = fetch_data(url)

    return unless response && response['drinks']

    response['drinks'].each do |drink_data|
      import_cocktail(drink_data)
    end

    print_summary
  end

  private

  def fetch_data(url)
    response = Net::HTTP.get_response(url)
    return nil unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  rescue StandardError => e
    puts "Error fetching data: #{e.message}"
    nil
  end

  def import_cocktail(drink_data)
    cocktail_name = drink_data['strDrink']

    # 既存チェック
    if Cocktail.exists?(name: cocktail_name)
      puts "⏭️  Skipped (already exists): #{cocktail_name}"
      @skipped_count += 1
      return
    end

    cocktail = nil

    begin
      ActiveRecord::Base.transaction do
        # カクテル名を翻訳
        cocktail_name_ja = @translation_service.translate_cocktail_name(cocktail_name)
        glass_ja = @translation_service.translate_glass(drink_data['strGlass'])

        # カクテルを作成
        cocktail = Cocktail.create!(
          name: cocktail_name,
          name_ja: cocktail_name_ja,
          base: map_base(drink_data),
          strength: map_strength(drink_data),
          technique: map_technique(drink_data),
          glass: drink_data['strGlass'],
          glass_ja: glass_ja,
          image_url: drink_data['strDrinkThumb'],
          instructions: drink_data['strInstructions']
        )

        # 材料を追加（翻訳付き）
        import_ingredients(cocktail, drink_data)
      end

      # トランザクション成功後に画像をダウンロード（失敗してもロールバックしない）
      if cocktail && drink_data['strDrinkThumb'].present?
        ImageDownloadService.download_and_attach(cocktail, drink_data['strDrinkThumb'])
      end

      puts "✅ Imported: #{cocktail_name} (#{cocktail&.name_ja})"
      @imported_count += 1

      # API負荷軽減のため少し待機（翻訳API）
      sleep 1.5
    rescue StandardError => e
      puts "❌ Error importing #{cocktail_name}: #{e.message}"
      Rails.logger.error("Full error: #{e.class}: #{e.message}\n#{e.backtrace.join("\n")}")
      @error_count += 1
    end
  end

  def import_ingredients(cocktail, drink_data)
    position = 1
    ingredients_to_translate = []
    measures_to_translate = []

    # まず材料情報を収集
    (1..15).each do |i|
      ingredient_name = drink_data["strIngredient#{i}"]
      measure = drink_data["strMeasure#{i}"]
      break if ingredient_name.blank?

      ingredients_to_translate << ingredient_name.strip
      measures_to_translate << (measure&.strip.presence || '適量')
    end

    # バッチ翻訳（1回のAPIコールで全材料を翻訳）
    translated_ingredients = @translation_service.translate_ingredients_batch(ingredients_to_translate)
    translated_measures = measures_to_translate.map do |measure|
      measure == '適量' ? '適量' : @translation_service.translate_measure(measure)
    end

    # 材料を作成
    ingredients_to_translate.each_with_index do |ingredient_name, index|
      ingredient_name_ja = translated_ingredients[index]

      # 材料を取得または作成
      ingredient = Ingredient.find_or_create_by!(name: ingredient_name) do |ing|
        ing.name_ja = ingredient_name_ja
      end

      # 既存の材料に日本語名がない場合は更新
      if ingredient.name_ja.blank? && ingredient_name_ja.present?
        ingredient.update!(name_ja: ingredient_name_ja)
      end

      amount = measures_to_translate[index]
      amount_ja = translated_measures[index]

      # カクテルと材料を関連付け
      CocktailIngredient.create!(
        cocktail: cocktail,
        ingredient: ingredient,
        amount_text: amount,
        amount_ja: amount_ja,
        position: position
      )

      position += 1
    end
  end

  # ベーススピリットを判定
  def map_base(drink_data)
    ingredients_text = (1..15).map { |i| drink_data["strIngredient#{i}"] }.compact.join(' ').downcase

    return :gin if ingredients_text.include?('gin')
    return :rum if ingredients_text.include?('rum')
    return :whisky if ingredients_text.include?('whisky') || ingredients_text.include?('whiskey') || ingredients_text.include?('bourbon')
    return :vodka if ingredients_text.include?('vodka')
    return :tequila if ingredients_text.include?('tequila')
    return :beer if ingredients_text.include?('beer')
    return :wine if ingredients_text.include?('wine') || ingredients_text.include?('champagne')

    :vodka # デフォルト
  end

  # アルコール度数を推定
  def map_strength(drink_data)
    alcoholic = drink_data['strAlcoholic']

    return :light if alcoholic == 'Non alcoholic'
    return :light if alcoholic == 'Optional alcohol'

    # カテゴリーから推定
    category = drink_data['strCategory']&.downcase || ''
    return :light if category.include?('beer') || category.include?('punch')
    return :strong if category.include?('shot')

    :medium # デフォルト
  end

  # 技法を推定
  def map_technique(drink_data)
    instructions = drink_data['strInstructions']&.downcase || ''

    return :shake if instructions.include?('shake')
    return :stir if instructions.include?('stir')
    return :build if instructions.include?('build') || instructions.include?('pour')

    :build # デフォルト
  end

  def print_summary
    puts "\n" + "=" * 50
    puts "Import Summary:"
    puts "  ✅ Imported: #{@imported_count}"
    puts "  ⏭️  Skipped:  #{@skipped_count}"
    puts "  ❌ Errors:   #{@error_count}"
    puts "=" * 50
  end
end
