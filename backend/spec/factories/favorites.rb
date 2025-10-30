FactoryBot.define do
  factory :favorite do
    association :user
    association :cocktail
  end
end
