# frozen_string_literal: true

namespace :cocktails do
  desc 'Fix cocktail base and strength using OpenAI'
  task fix_attributes: :environment do
    puts "Fixing cocktail base and strength attributes..."
    puts "=" * 50

    translation_service = TranslationService.new
    updated_count = 0
    error_count = 0

    Cocktail.find_each.with_index do |cocktail, index|
      begin
        # 材料リストを取得
        ingredients_list = cocktail.cocktail_ingredients.includes(:ingredient).map do |ci|
          ci.ingredient.name
        end

        # ベースと強度を判定
        base = translation_service.determine_base(ingredients_list)
        strength = translation_service.determine_strength(
          ingredients_list,
          cocktail.instructions&.include?('Non alcoholic') ? 'Non alcoholic' : 'Alcoholic'
        )

        # 更新
        cocktail.update!(
          base: base,
          strength: strength
        )

        puts "  [#{index + 1}] #{cocktail.name}: base=#{base}, strength=#{strength}"
        updated_count += 1

        sleep 0.5 # API負荷軽減
      rescue StandardError => e
        puts "  ❌ Error: #{cocktail.name} - #{e.message}"
        error_count += 1
      end
    end

    puts "\n" + "=" * 50
    puts "Summary:"
    puts "  ✅ Updated: #{updated_count}"
    puts "  ❌ Errors: #{error_count}"
    puts "=" * 50
  end
end
