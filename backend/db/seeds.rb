# frozen_string_literal: true

puts "Cleaning up existing data..."

# 既存データを削除
CocktailIngredient.destroy_all
Ingredient.destroy_all
Cocktail.destroy_all

puts "Seeding cocktails and ingredients..."

# enum mapping
BASE_MAP = {
  'ジン' => :gin,
  'ラム' => :rum,
  'ウイスキー' => :whisky,
  'ウォッカ' => :vodka,
  'テキーラ' => :tequila,
  'ビール' => :beer,
  'ワイン' => :wine
}

STRENGTH_MAP = {
  'ライト' => :light,
  'ミディアム' => :medium,
  'ストロング' => :strong
}

TECHNIQUE_MAP = {
  'ビルド' => :build,
  'ステア' => :stir,
  'シェイク' => :shake
}

# Figmaデータをベースにしたカクテルデータ
cocktails_data = [
  {
    name: 'マティーニ',
    base: 'ジン',
    strength: 'ストロング',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    ingredients: [
      { name: 'ドライジン', amount: '45ml' },
      { name: 'ドライベルモット', amount: '15ml' },
      { name: 'オリーブ', amount: '1個' }
    ],
    instructions: 'ミキシンググラスに氷を入れ、ジンとベルモットを注ぎステアする。カクテルグラスに濾して注ぎ、オリーブを飾る。',
    glass: 'カクテルグラス',
    technique: 'ステア'
  },
  {
    name: 'ジントニック',
    base: 'ジン',
    strength: 'ライト',
    image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
    ingredients: [
      { name: 'ドライジン', amount: '45ml' },
      { name: 'トニックウォーター', amount: '適量' },
      { name: 'ライム', amount: '1/8個' }
    ],
    instructions: 'タンブラーに氷を入れ、ジンを注ぐ。トニックウォーターで満たし、軽くステアする。ライムを絞って落とす。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'モスコミュール',
    base: 'ウォッカ',
    strength: 'ライト',
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '45ml' },
      { name: 'ジンジャーエール', amount: '適量' },
      { name: 'ライム', amount: '1/2個' }
    ],
    instructions: 'タンブラーに氷を入れ、ライムを絞る。ウォッカを注ぎ、ジンジャーエールで満たす。軽くステアする。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'マルガリータ',
    base: 'テキーラ',
    strength: 'ミディアム',
    image_url: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
    ingredients: [
      { name: 'テキーラ', amount: '30ml' },
      { name: 'ホワイトキュラソー', amount: '15ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: '塩', amount: '適量' }
    ],
    instructions: 'グラスの縁に塩をつける（スノースタイル）。シェイカーに氷と材料を入れシェイクする。グラスに注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'モヒート',
    base: 'ラム',
    strength: 'ライト',
    image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
    ingredients: [
      { name: 'ホワイトラム', amount: '45ml' },
      { name: 'ライム', amount: '1/2個' },
      { name: 'ミントの葉', amount: '10枚' },
      { name: '砂糖', amount: '2tsp' },
      { name: 'ソーダ', amount: '適量' }
    ],
    instructions: 'グラスにミント、砂糖、ライムを入れ潰す。クラッシュドアイスを入れ、ラムを注ぐ。ソーダで満たし、ステアする。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'ウイスキーサワー',
    base: 'ウイスキー',
    strength: 'ミディアム',
    image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
    ingredients: [
      { name: 'ウイスキー', amount: '45ml' },
      { name: 'レモンジュース', amount: '20ml' },
      { name: 'シュガーシロップ', amount: '15ml' },
      { name: '卵白', amount: '適量' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。ロックグラスに注ぎ、レモンとチェリーを飾る。',
    glass: 'ロックグラス',
    technique: 'シェイク'
  },
  {
    name: 'マンハッタン',
    base: 'ウイスキー',
    strength: 'ストロング',
    image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'ライウイスキー', amount: '50ml' },
      { name: 'スイートベルモット', amount: '25ml' },
      { name: 'アンゴスチュラビターズ', amount: '1dash' },
      { name: 'マラスキーノチェリー', amount: '1個' }
    ],
    instructions: 'ミキシンググラスに氷と材料を入れステアする。カクテルグラスに濾して注ぎ、チェリーを飾る。',
    glass: 'カクテルグラス',
    technique: 'ステア'
  },
  {
    name: 'コスモポリタン',
    base: 'ウォッカ',
    strength: 'ミディアム',
    image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '40ml' },
      { name: 'ホワイトキュラソー', amount: '15ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: 'クランベリージュース', amount: '30ml' }
    ],
    instructions: 'シェイカーに氷と全ての材料を入れシェイクする。カクテルグラスに濾して注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'ネグローニ',
    base: 'ジン',
    strength: 'ストロング',
    image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    ingredients: [
      { name: 'ジン', amount: '30ml' },
      { name: 'カンパリ', amount: '30ml' },
      { name: 'スイートベルモット', amount: '30ml' },
      { name: 'オレンジピール', amount: '1個' }
    ],
    instructions: 'ロックグラスに氷と材料を入れステアする。オレンジピールを絞って飾る。',
    glass: 'ロックグラス',
    technique: 'ビルド'
  },
  {
    name: 'ダイキリ',
    base: 'ラム',
    strength: 'ミディアム',
    image_url: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800',
    ingredients: [
      { name: 'ホワイトラム', amount: '45ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: 'シュガーシロップ', amount: '10ml' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。カクテルグラスに濾して注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'テキーラサンライズ',
    base: 'テキーラ',
    strength: 'ライト',
    image_url: 'https://unsplash.com/ja/%E5%86%99%E7%9C%9F/%E3%83%88%E3%83%AC%E3%82%A4%E3%81%AB2%E3%81%A4%E3%81%AE%E3%82%B0%E3%83%A9%E3%82%B9%E3%81%A8%E3%82%A2%E3%83%AB%E3%82%B3%E3%83%BC%E3%83%AB%E3%81%AE%E3%83%9C%E3%83%88%E3%83%AB-9ak6t_5ERVo?w=800',
    ingredients: [
      { name: 'テキーラ', amount: '45ml' },
      { name: 'オレンジジュース', amount: '90ml' },
      { name: 'グレナデンシロップ', amount: '15ml' }
    ],
    instructions: 'タンブラーに氷を入れ、テキーラとオレンジジュースを注ぎステアする。グレナデンシロップを静かに注ぎ、グラデーションを作る。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'オールドファッションド',
    base: 'ウイスキー',
    strength: 'ストロング',
    image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'バーボンウイスキー', amount: '60ml' },
      { name: '角砂糖', amount: '1個' },
      { name: 'アンゴスチュラビターズ', amount: '2dash' },
      { name: 'オレンジピール', amount: '1個' }
    ],
    instructions: 'ロックグラスに角砂糖とビターズを入れ、少量の水で溶かす。氷を入れウイスキーを注ぎステアする。オレンジピールを飾る。',
    glass: 'ロックグラス',
    technique: 'ビルド'
  }
]

# カクテルと材料を作成
cocktails_data.each_with_index do |data, index|
  puts "Creating cocktail: #{data[:name]}"

  # バリデーション
  base = BASE_MAP[data[:base]]
  strength = STRENGTH_MAP[data[:strength]]
  technique = TECHNIQUE_MAP[data[:technique]]

  if base.nil? || strength.nil? || technique.nil?
    raise ArgumentError, "Invalid enum mapping for cocktail: #{data[:name]}"
  end

  # カクテル作成
  cocktail = Cocktail.create!(
    name: data[:name],
    base: base,
    strength: strength,
    technique: technique,
    image_url: data[:image_url],
    instructions: data[:instructions],
    glass: data[:glass]
  )

  # 材料作成
  data[:ingredients].each_with_index do |ingredient_data, position|
    # 材料をマスタテーブルで作成・取得（重複なし）
    ingredient = Ingredient.find_or_create_by!(name: ingredient_data[:name])

    # 中間テーブルに関係を作成
    CocktailIngredient.create!(
      cocktail: cocktail,
      ingredient: ingredient,
      amount_text: ingredient_data[:amount],
      position: position + 1
    )
  end
end

puts "✅ Seeded #{Cocktail.count} cocktails"
puts "✅ Seeded #{Ingredient.count} unique ingredients"
puts "✅ Seeded #{CocktailIngredient.count} cocktail-ingredient relationships"
