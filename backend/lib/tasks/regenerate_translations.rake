# frozen_string_literal: true

namespace :cocktails do
  desc "Regenerate translation-related fields (set COCKTAIL_IDS=1,2 or FORCE=true, FIELDS=name_ja,glass_ja,ingredient_names,amounts,instructions_ja,description,base,strength)"
  task regenerate_translations: :environment do
    force = ActiveModel::Type::Boolean.new.cast(ENV["FORCE"])
    ids = ENV["COCKTAIL_IDS"]&.split(",")&.map(&:strip)&.reject(&:blank?)
    fields = ENV["FIELDS"]&.split(",")&.map { |f| f.strip.underscore.to_sym }

    regenerator = CocktailRegenerator.new(
      force: force,
      cocktail_ids: ids,
      fields: fields
    )

    regenerator.run
  end
end

class CocktailRegenerator
  DEFAULT_FIELDS = %i[
    name_ja
    glass_ja
    ingredient_names
    amounts
    instructions_ja
    description
    base
    strength
  ].freeze

  def initialize(force:, cocktail_ids:, fields: nil)
    @force = force
    @cocktail_ids = cocktail_ids
    @fields = fields.presence || DEFAULT_FIELDS
    @translation_service = TranslationService.new
    @stats = Hash.new(0)
  end

  def run
    puts "\n==> Regenerating translation fields"
    regenerate_cocktails if needs_any?(:name_ja, :glass_ja, :instructions_ja, :description, :base, :strength, :amounts, :ingredient_names)
    summary
  end

  private

  def cocktail_scope
    @cocktail_scope ||= begin
      scope = Cocktail.includes(cocktail_ingredients: :ingredient)
      scope = scope.where(id: @cocktail_ids) if @cocktail_ids.present?
      scope
    end
  end

  def needs?(field)
    @fields.include?(field)
  end

  def needs_any?(*fields)
    fields.any? { |f| needs?(f) }
  end

  def regenerate_cocktails
    cocktail_scope.find_each.with_index do |cocktail, index|
      updates = {}

      if needs?(:name_ja) && (@force || cocktail.name_ja.blank?)
        updates[:name_ja] = @translation_service.translate_cocktail_name(cocktail.name)
        @stats[:name_ja] += 1 if updates[:name_ja].present?
      end

      if needs?(:glass_ja) && cocktail.glass.present? && (@force || cocktail.glass_ja.blank?)
        updates[:glass_ja] = @translation_service.translate_glass(cocktail.glass)
        @stats[:glass_ja] += 1 if updates[:glass_ja].present?
      end

      if needs?(:instructions_ja) && cocktail.instructions.present? && (@force || cocktail.instructions_ja.blank?)
        updates[:instructions_ja] = @translation_service.translate_instructions(cocktail.instructions)
        @stats[:instructions_ja] += 1 if updates[:instructions_ja].present?
      end

      if needs?(:description) && (@force || cocktail.description.blank?)
        updates[:description] = @translation_service.generate_description(
          cocktail.name_ja.presence || cocktail.name,
          cocktail.base,
          cocktail.strength,
          cocktail.cocktail_ingredients.map { |ci| ci.ingredient&.name }.compact
        )
        @stats[:description] += 1 if updates[:description].present?
      end

      if needs?(:base) && (@force || cocktail.base.blank?)
        base_result = @translation_service.determine_base(
          cocktail.cocktail_ingredients.map { |ci| ci.ingredient&.name }.compact
        )
        if base_result.present? && Cocktail.bases.key?(base_result)
          updates[:base] = base_result
          @stats[:base] += 1
        end
      end

      if needs?(:strength) && (@force || cocktail.strength.blank?)
        strength_result = @translation_service.determine_strength(
          cocktail.name_ja.presence || cocktail.name,
          cocktail.cocktail_ingredients.map { |ci| ci.ingredient&.name }.compact
        )
        if strength_result.present? && Cocktail.strengths.key?(strength_result)
          updates[:strength] = strength_result
          @stats[:strength] += 1
        end
      end

      cocktail.update!(updates.compact) if updates.compact.present?

      regenerate_ingredient_data(cocktail)
      puts format("  [%<index>d] %<name>s updated", index: index + 1, name: cocktail.name)
    rescue StandardError => e
      Rails.logger.error("Regeneration failed for #{cocktail.name}: #{e.message}")
      puts "  ❌ Error: #{cocktail.name} - #{e.message}"
    end
  end

  def regenerate_ingredient_data(cocktail)
    cocktail.cocktail_ingredients.each do |ci|
      ingredient = ci.ingredient

      if ingredient.present? && needs?(:ingredient_names) && (@force || ingredient.name_ja.blank?)
        new_name = @translation_service.translate_ingredient_name(ingredient.name)
        if new_name.present?
          ingredient.update!(name_ja: new_name)
          @stats[:ingredient_names] += 1
        end
      end

      if needs?(:amounts) && ci.amount_text.present? && (@force || ci.amount_ja.blank?)
        amount_ja = @translation_service.translate_measure(ci.amount_text)
        if amount_ja.present?
          ci.update!(amount_ja: amount_ja)
          @stats[:amounts] += 1
        end
      end
    end
  end

  def summary
    puts "\nSummary:"
    DEFAULT_FIELDS.each do |field|
      next unless @stats.key?(field)

      label = field.to_s.humanize
      puts format("  %-20s %d", label, @stats[field])
    end
  end
end
