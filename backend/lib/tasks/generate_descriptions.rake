# frozen_string_literal: true

namespace :cocktails do
  desc "Generate cocktail descriptions using OpenAI"
  task generate_descriptions: :environment do
    puts "Generating cocktail descriptions..."
    puts "=" * 50

    translation_service = TranslationService.new
    generated_count = 0
    skipped_count = 0
    error_count = 0

    Cocktail.find_each.with_index do |cocktail, index|
      # 既に説明文がある場合はスキップ
      if cocktail.description.present?
        puts "  [#{index + 1}] #{cocktail.name}: ⏭️  Already has description"
        skipped_count += 1
        next
      end

      begin
        # 材料リストを取得
        ingredients_list = cocktail.cocktail_ingredients.includes(:ingredient).map do |ci|
          ci.ingredient.name
        end

        # 説明文を生成
        description = translation_service.generate_description(
          cocktail.name_ja || cocktail.name,
          cocktail.base,
          cocktail.strength,
          ingredients_list
        )

        if description.present?
          cocktail.update!(description: description)
          puts "  [#{index + 1}] #{cocktail.name}: ✅ Description generated"
          generated_count += 1
          sleep 1 # API負荷軽減
        else
          puts "  [#{index + 1}] #{cocktail.name}: ⚠️  No description generated"
        end
      rescue StandardError => e
        puts "  [#{index + 1}] #{cocktail.name}: ❌ Error - #{e.message}"
        error_count += 1
      end
    end

    puts "\n" + "=" * 50
    puts "Summary:"
    puts "  ✅ Generated: #{generated_count}"
    puts "  ⏭️  Skipped: #{skipped_count}"
    puts "  ❌ Errors: #{error_count}"
    puts "=" * 50
  end
end
