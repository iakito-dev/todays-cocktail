FactoryBot.define do
  factory :jwt_denylist do
    jti { "MyString" }
    exp { 1.day.from_now }
  end
end
