FactoryBot.define do
  factory :cocktail_ingredient do
    association :cocktail
    association :ingredient
    sequence(:amount_text) { |n| "#{15 + n * 15}ml" }
    position { 1 }
  end
end
