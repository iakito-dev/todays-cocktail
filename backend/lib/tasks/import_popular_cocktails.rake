# frozen_string_literal: true

namespace :cocktails do
  desc 'Import popular cocktails that Japanese people love'
  task import_popular: :environment do
    puts "Importing popular cocktails..."
    puts "=" * 50

    importer = PopularCocktailImporter.new
    importer.import_all

    puts "\n" + "=" * 50
    puts "Import completed!"
    puts "Total cocktails: #{Cocktail.count}"
    puts "Total ingredients: #{Ingredient.count}"
  end

  desc 'Translate existing cocktails to Japanese'
  task translate_all: :environment do
    puts "Translating cocktails to Japanese..."
    puts "=" * 50

    translator = CocktailTranslator.new
    translator.translate_all

    puts "\n" + "=" * 50
    puts "Translation completed!"
  end
end

class PopularCocktailImporter
  # 日本で人気の有名カクテルリスト
  POPULAR_COCKTAILS = [
    # クラシック・定番
    'Mojito',
    'Margarita',
    'Cosmopolitan',
    'Martini',
    'Manhattan',
    'Old Fashioned',
    'Negroni',
    'Daiquiri',
    'Whiskey Sour',
    'Moscow Mule',

    # トロピカル・フルーティー
    'Pina Colada',
    'Mai Tai',
    'Blue Hawaiian',
    'Sex on the Beach',
    'Tequila Sunrise',
    'Sangria',

    # モダン・人気
    'Espresso Martini',
    'Aperol Spritz',
    'French 75',
    'Aviation',
    'Pornstar Martini',
    'Passion Fruit Martini',

    # シンプル・定番
    'Gin and Tonic',
    'Cuba Libre',
    'Screwdriver',
    'Bloody Mary',
    'Tom Collins',
    'Gimlet',
    'Caipirinha',

    # ウイスキーベース
    'Mint Julep',
    'Irish Coffee',
    'Sazerac',
    'Boulevardier',

    # ラムベース
    'Dark and Stormy',
    'Zombie',
    'Hemingway Special',

    # シャンパン・ワインベース
    'Mimosa',
    'Bellini',
    'Kir',
    'Kir Royale',

    # その他人気
    'White Russian',
    'Long Island Iced Tea',
    'Amaretto Sour',
    'Paloma',
    'Vesper',
    'Sidecar'
  ].freeze

  def initialize
    @imported_count = 0
    @skipped_count = 0
    @error_count = 0
    @not_found_count = 0
    # 翻訳はスキップ
    @translation_service = nil
  end

  def import_all
    POPULAR_COCKTAILS.each_with_index do |cocktail_name, index|
      puts "\n[#{index + 1}/#{POPULAR_COCKTAILS.size}] Processing: #{cocktail_name}"

      begin
        import_cocktail(cocktail_name)
      rescue StandardError => e
        puts "  ❌ Error: #{e.message}"
        @error_count += 1
      end

      # API負荷軽減
      sleep 0.5 if index < POPULAR_COCKTAILS.size - 1
    end

    print_summary
  end

  private

  def import_cocktail(cocktail_name)
    # 既存チェック
    if Cocktail.exists?(name: cocktail_name)
      puts "  ⏭️  Already exists"
      @skipped_count += 1
      return
    end

    # APIから検索
    require 'net/http'
    require 'json'

    url = URI("https://www.thecocktaildb.com/api/json/v1/1/search.php?s=#{URI.encode_www_form_component(cocktail_name)}")
    response = Net::HTTP.get_response(url)

    unless response.is_a?(Net::HTTPSuccess)
      puts "  ⚠️  API error"
      @error_count += 1
      return
    end

    data = JSON.parse(response.body)
    drinks = data['drinks']

    unless drinks && drinks.any?
      puts "  ⚠️  Not found in API"
      @not_found_count += 1
      return
    end

    # 完全一致するものを探す
    drink_data = drinks.find { |d| d['strDrink'].downcase == cocktail_name.downcase }
    drink_data ||= drinks.first # なければ最初のものを使用

    cocktail = nil

    ActiveRecord::Base.transaction do
      # 翻訳はスキップして後でバッチ処理
      # cocktail_name_ja = @translation_service.translate_cocktail_name(drink_data['strDrink'])
      # glass_ja = @translation_service.translate_glass(drink_data['strGlass'])

      # カクテル作成
      cocktail = Cocktail.create!(
        name: drink_data['strDrink'],
        name_ja: nil, # 後で翻訳
        base: map_base(drink_data),
        strength: map_strength(drink_data),
        technique: map_technique(drink_data),
        glass: drink_data['strGlass'],
        glass_ja: nil, # 後で翻訳
        image_url: drink_data['strDrinkThumb'],
        instructions: drink_data['strInstructions']
      )

      # 材料追加
      import_ingredients(cocktail, drink_data)
    end

    # 画像ダウンロード
    if cocktail && drink_data['strDrinkThumb'].present?
      ImageDownloadService.download_and_attach(cocktail, drink_data['strDrinkThumb'])
    end

    puts "   Imported: #{drink_data['strDrink']}"
    @imported_count += 1
  end

  def import_ingredients(cocktail, drink_data)
    position = 1
    ingredients_list = []

    # 材料情報を収集
    (1..15).each do |i|
      ingredient_name = drink_data["strIngredient#{i}"]
      measure = drink_data["strMeasure#{i}"]
      break if ingredient_name.blank?

      ingredients_list << {
        name: ingredient_name.strip,
        amount: measure&.strip.presence || '適量'
      }
    end

    # 材料作成（翻訳なし）
    ingredients_list.each do |ing_data|
      ingredient = Ingredient.find_or_create_by!(name: ing_data[:name])

      CocktailIngredient.create!(
        cocktail: cocktail,
        ingredient: ingredient,
        amount_text: ing_data[:amount],
        amount_ja: nil, # 後で翻訳
        position: position
      )

      position += 1
    end
  end

  def map_base(drink_data)
    ingredients_text = (1..15).map { |i| drink_data["strIngredient#{i}"] }.compact.join(' ').downcase

    return :gin if ingredients_text.include?('gin')
    return :rum if ingredients_text.include?('rum')
    return :whisky if ingredients_text.include?('whisky') || ingredients_text.include?('whiskey') || ingredients_text.include?('bourbon')
    return :vodka if ingredients_text.include?('vodka')
    return :tequila if ingredients_text.include?('tequila')
    return :beer if ingredients_text.include?('beer')
    return :wine if ingredients_text.include?('wine') || ingredients_text.include?('champagne')

    :vodka
  end

  def map_strength(drink_data)
    alcoholic = drink_data['strAlcoholic']

    return :light if alcoholic == 'Non alcoholic'
    return :light if alcoholic == 'Optional alcohol'

    category = drink_data['strCategory']&.downcase || ''
    return :light if category.include?('beer') || category.include?('punch')
    return :strong if category.include?('shot')

    :medium
  end

  def map_technique(drink_data)
    instructions = drink_data['strInstructions']&.downcase || ''

    return :shake if instructions.include?('shake')
    return :stir if instructions.include?('stir')
    return :build if instructions.include?('build') || instructions.include?('pour')

    :build
  end

  def print_summary
    puts "\n" + "=" * 50
    puts "Summary:"
    puts "   Imported:   #{@imported_count}"
    puts "  ⏭️  Skipped:    #{@skipped_count}"
    puts "  ⚠️  Not Found:  #{@not_found_count}"
    puts "  ❌ Errors:     #{@error_count}"
    puts "=" * 50
  end
end

# 既存のカクテルを翻訳するクラス
class CocktailTranslator
  def initialize
    @translation_service = TranslationService.new
    @translated_count = 0
    @skipped_count = 0
    @error_count = 0
  end

  def translate_all
    translate_cocktails
    translate_ingredients
    print_summary
  end

  private

  def translate_cocktails
    puts "\n1. Translating cocktail names and glasses..."

    Cocktail.where(name_ja: nil).find_each.with_index do |cocktail, index|
      begin
        name_ja = @translation_service.translate_cocktail_name(cocktail.name)
        glass_ja = @translation_service.translate_glass(cocktail.glass) if cocktail.glass.present?

        cocktail.update!(name_ja: name_ja, glass_ja: glass_ja)

        puts "   [#{index + 1}] #{cocktail.name} → #{name_ja}"
        @translated_count += 1

        sleep 1 # API負荷軽減
      rescue StandardError => e
        puts "  ❌ Error: #{cocktail.name} - #{e.message}"
        @error_count += 1
      end
    end
  end

  def translate_ingredients
    puts "\n2. Translating ingredient names..."

    # 重複を避けるため、ユニークな材料名のみを翻訳
    unique_ingredient_names = Ingredient.where(name_ja: nil).distinct.pluck(:name)

    unique_ingredient_names.each.with_index do |ingredient_name, index|
      begin
        name_ja = @translation_service.translate_ingredient_name(ingredient_name)

        # 同じ名前の材料すべてを更新
        Ingredient.where(name: ingredient_name).update_all(name_ja: name_ja)

        puts "   [#{index + 1}] #{ingredient_name} → #{name_ja}"

        sleep 0.5 # API負荷軽減
      rescue StandardError => e
        puts "  ❌ Error: #{ingredient_name} - #{e.message}"
        @error_count += 1
      end
    end
  end

  def print_summary
    puts "\n" + "=" * 50
    puts "Translation Summary:"
    puts "   Translated: #{@translated_count}"
    puts "  ⏭️  Skipped:    #{@skipped_count}"
    puts "  ❌ Errors:     #{@error_count}"
    puts "=" * 50
  end
end
