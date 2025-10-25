FactoryBot.define do
  factory :cocktail do
    name { "MyString" }
    base { 1 }
    strength { 1 }
    technique { 1 }
    image_url { "MyString" }
    instructions { "MyText" }
  end
end
