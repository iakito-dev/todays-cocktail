FactoryBot.define do
  factory :cocktail do
    sequence(:name) { |n| "カクテル#{n}" }
    base { :gin }
    strength { :medium }
    technique { :build }
    instructions { "グラスに材料を入れて軽くステアする。" }
    glass { "タンブラー" }

    trait :with_ingredients do
      after(:create) do |cocktail|
        ingredient1 = create(:ingredient, name: "#{cocktail.name}_ジン")
        ingredient2 = create(:ingredient, name: "#{cocktail.name}_トニック")

        create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient1, amount_text: '45ml', position: 1)
        create(:cocktail_ingredient, cocktail: cocktail, ingredient: ingredient2, amount_text: '適量', position: 2)
      end
    end
  end
end
