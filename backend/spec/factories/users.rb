FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    name { 'Test User' }
    password { 'password123' }
    password_confirmation { 'password123' }

    trait :confirmed do
      confirmed_at { Time.current }
    end

    trait :admin do
      admin { true }
      confirmed_at { Time.current }
    end

    trait :unconfirmed do
      confirmed_at { nil }
    end
  end
end
