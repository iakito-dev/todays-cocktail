FactoryBot.define do
  factory :cocktail_ingredient do
    association :cocktail
    association :ingredient
    amount_text { "45ml" }
    position { 1 }
  end
end
