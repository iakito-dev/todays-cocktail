FactoryBot.define do
  factory :ingredient do
    sequence(:name) { |n| "材料#{n}" }
  end
end
