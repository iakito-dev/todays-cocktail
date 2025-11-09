require 'rails_helper'

RSpec.describe Ingredient, type: :model do
  # 材料モデルはシンプルなので、各セクションの狙いを共通フォーマットで揃える

  # Section: Associations — カクテルとの多対多が壊れると全レシピが取得できなくなる
  describe 'associations' do
    it { should have_many(:cocktail_ingredients).dependent(:destroy) }
    it { should have_many(:cocktails).through(:cocktail_ingredients) }
  end

  # Section: Validations — name の必須・ユニーク性は importer で頼りにする
  describe 'validations' do
    it { should validate_presence_of(:name) }

    it 'validates uniqueness of name' do
      # uniqueness マッチャは既存レコードが無いと動かないので事前に1件作成
      create(:ingredient, name: 'TestIngredient')
      should validate_uniqueness_of(:name)
    end
  end

  # Section: Creating ingredients — 同じ材料を複数レシピに使えることを保証
  describe 'creating ingredients' do
    it 'can create multiple cocktails with the same ingredient' do
      # 同じ材料が複数カクテルに紐付けられることを E2E で検証しておくと join テーブルの制約が守られる
      ingredient = create(:ingredient)
      cocktail1 = create(:cocktail)
      cocktail2 = create(:cocktail)

      create(:cocktail_ingredient, cocktail: cocktail1, ingredient: ingredient, amount_text: '45ml', position: 1)
      create(:cocktail_ingredient, cocktail: cocktail2, ingredient: ingredient, amount_text: '30ml', position: 1)

      expect(ingredient.cocktails.count).to eq(2)
    end
  end
end
