# frozen_string_literal: true

# Seeds file - データベースへの初期データ投入用
#
# 本番環境では既にデータが投入されているため、このファイルは実行されません。
# 開発環境で新規にデータベースをセットアップする場合は、
# 以下のrakeタスクを使用してください:
#   bin/rails cocktails:import_popular
#
# または、個別にカクテルを追加する場合は、Rails consoleを使用してください。

puts "Seeds file is empty. Use 'rails cocktails:import_popular' to import cocktails."

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

cocktails_data = [
  {
    name: 'マティーニ',
    base: 'ジン',
    strength: 'ストロング',
    image_url_override: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800',
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
    image_url_override: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
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
    name: 'オールドファッション',
    base: 'ウイスキー',
    strength: 'ストロング',
    image_url_override: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'バーボンウイスキー', amount: '60ml' },
      { name: '角砂糖', amount: '1個' },
      { name: 'アンゴスチュラビターズ', amount: '2dash' },
      { name: 'オレンジピール', amount: '1個' }
    ],
    instructions: 'ロックグラスに角砂糖とビターズを入れ、少量の水で溶かす。氷を入れウイスキーを注ぎステアする。オレンジピールを飾る。',
    glass: 'ロックグラス',
    technique: 'ビルド'
  },
  {
    name: 'エスプレッソマティーニ',
    base: 'ウォッカ',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '50ml' },
      { name: 'カルーアコーヒーリキュール', amount: '25ml' },
      { name: 'エスプレッソ', amount: '30ml' },
      { name: 'シュガーシロップ', amount: '10ml' }
    ],
    instructions: 'シェイカーに氷と全ての材料を入れ、力強くシェイクする。カクテルグラスに濾して注ぎ、コーヒー豆を飾る。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'ピニャコラーダ',
    base: 'ラム',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=800',
    ingredients: [
      { name: 'ホワイトラム', amount: '45ml' },
      { name: 'ココナッツクリーム', amount: '30ml' },
      { name: 'パイナップルジュース', amount: '90ml' },
      { name: 'パイナップル', amount: '適量' }
    ],
    instructions: 'ブレンダーに氷と全ての材料を入れミキシングする。グラスに注ぎ、パイナップルとチェリーを飾る。',
    glass: 'トロピカルグラス',
    technique: 'シェイク'
  },
  {
    name: 'ブラッディメアリー',
    base: 'ウォッカ',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '45ml' },
      { name: 'トマトジュース', amount: '90ml' },
      { name: 'レモンジュース', amount: '15ml' },
      { name: 'タバスコ', amount: '3dash' },
      { name: '塩・胡椒', amount: '適量' }
    ],
    instructions: 'タンブラーに氷と全ての材料を入れステアする。セロリやレモンを飾る。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'カイピリーニャ',
    base: 'ラム',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800',
    ingredients: [
      { name: 'カシャーサ', amount: '60ml' },
      { name: 'ライム', amount: '1個' },
      { name: 'ブラウンシュガー', amount: '2tsp' }
    ],
    instructions: 'グラスにカットしたライムと砂糖を入れ潰す。クラッシュドアイスを入れ、カシャーサを注ぎステアする。',
    glass: 'ロックグラス',
    technique: 'ビルド'
  },
  {
    name: 'アマレットサワー',
    base: 'ウイスキー',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
    ingredients: [
      { name: 'アマレット', amount: '45ml' },
      { name: 'レモンジュース', amount: '30ml' },
      { name: 'シュガーシロップ', amount: '15ml' },
      { name: '卵白', amount: '適量' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。ロックグラスに注ぎ、レモンとチェリーを飾る。',
    glass: 'ロックグラス',
    technique: 'シェイク'
  },
  {
    name: 'ロングアイランドアイスティー',
    base: 'ウォッカ',
    strength: 'ストロング',
    image_url_override: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '15ml' },
      { name: 'ホワイトラム', amount: '15ml' },
      { name: 'ジン', amount: '15ml' },
      { name: 'テキーラ', amount: '15ml' },
      { name: 'ホワイトキュラソー', amount: '15ml' },
      { name: 'レモンジュース', amount: '30ml' },
      { name: 'コーラ', amount: '適量' }
    ],
    instructions: 'タンブラーに氷と材料を入れステアする。コーラで満たし、レモンを飾る。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'ギムレット',
    base: 'ジン',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    ingredients: [
      { name: 'ドライジン', amount: '45ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: 'シュガーシロップ', amount: '10ml' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。カクテルグラスに濾して注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'サイドカー',
    base: 'ウイスキー',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'ブランデー', amount: '30ml' },
      { name: 'ホワイトキュラソー', amount: '15ml' },
      { name: 'レモンジュース', amount: '15ml' },
      { name: '砂糖', amount: '適量' }
    ],
    instructions: 'グラスの縁に砂糖をつける。シェイカーに氷と材料を入れシェイクする。グラスに注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'アペロールスピリッツ',
    base: 'ジン',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'アペロール', amount: '60ml' },
      { name: 'プロセッコ', amount: '90ml' },
      { name: 'ソーダ', amount: '30ml' },
      { name: 'オレンジスライス', amount: '1個' }
    ],
    instructions: 'ワイングラスに氷を入れ、アペロール、プロセッコ、ソーダの順に注ぎ軽くステアする。オレンジを飾る。',
    glass: 'ワイングラス',
    technique: 'ビルド'
  },
  {
    name: 'フレンチ75',
    base: 'ジン',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    ingredients: [
      { name: 'ドライジン', amount: '30ml' },
      { name: 'レモンジュース', amount: '15ml' },
      { name: 'シュガーシロップ', amount: '10ml' },
      { name: 'シャンパン', amount: '60ml' }
    ],
    instructions: 'シェイカーにジン、レモンジュース、シロップを入れシェイクする。シャンパングラスに注ぎ、シャンパンで満たす。',
    glass: 'シャンパングラス',
    technique: 'シェイク'
  },
  {
    name: 'パロマ',
    base: 'テキーラ',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
    ingredients: [
      { name: 'テキーラ', amount: '50ml' },
      { name: 'グレープフルーツジュース', amount: '75ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: 'ソーダ', amount: '適量' },
      { name: '塩', amount: '適量' }
    ],
    instructions: 'グラスの縁に塩をつける。氷を入れテキーラ、グレープフルーツジュース、ライムジュースを注ぎ、ソーダで満たす。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'ウイスキーハイボール',
    base: 'ウイスキー',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
    ingredients: [
      { name: 'ウイスキー', amount: '45ml' },
      { name: 'ソーダ', amount: '適量' },
      { name: 'レモンピール', amount: '1個' }
    ],
    instructions: 'タンブラーに氷を入れ、ウイスキーを注ぐ。ソーダで満たし、軽くステアする。レモンピールを絞って落とす。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'ケープコッダー',
    base: 'ウォッカ',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '45ml' },
      { name: 'クランベリージュース', amount: '120ml' },
      { name: 'ライム', amount: '1/4個' }
    ],
    instructions: 'タンブラーに氷を入れ、ウォッカとクランベリージュースを注ぎステアする。ライムを絞って落とす。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'ミントジュレップ',
    base: 'ウイスキー',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
    ingredients: [
      { name: 'バーボンウイスキー', amount: '60ml' },
      { name: 'ミントの葉', amount: '10枚' },
      { name: 'シュガーシロップ', amount: '15ml' },
      { name: '水', amount: '少量' }
    ],
    instructions: 'グラスにミント、シロップ、水を入れ潰す。クラッシュドアイスを入れウイスキーを注ぎステアする。ミントを飾る。',
    glass: 'ジュレップカップ',
    technique: 'ビルド'
  },
  {
    name: 'ブルーハワイ',
    base: 'ラム',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800',
    ingredients: [
      { name: 'ホワイトラム', amount: '30ml' },
      { name: 'ブルーキュラソー', amount: '15ml' },
      { name: 'パイナップルジュース', amount: '60ml' },
      { name: 'レモンジュース', amount: '15ml' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。氷を入れたグラスに注ぐ。パイナップルとチェリーを飾る。',
    glass: 'タンブラー',
    technique: 'シェイク'
  },
  {
    name: 'アヴィエーション',
    base: 'ジン',
    strength: 'ミディアム',
    image_url_override: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
    ingredients: [
      { name: 'ドライジン', amount: '45ml' },
      { name: 'マラスキーノリキュール', amount: '15ml' },
      { name: 'クレーム・ド・ヴィオレット', amount: '7.5ml' },
      { name: 'レモンジュース', amount: '15ml' }
    ],
    instructions: 'シェイカーに氷と材料を入れシェイクする。カクテルグラスに濾して注ぐ。',
    glass: 'カクテルグラス',
    technique: 'シェイク'
  },
  {
    name: 'ソルティドッグ',
    base: 'ウォッカ',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
    ingredients: [
      { name: 'ウォッカ', amount: '45ml' },
      { name: 'グレープフルーツジュース', amount: '適量' },
      { name: '塩', amount: '適量' }
    ],
    instructions: 'グラスの縁に塩をつける。氷を入れウォッカとグレープフルーツジュースを注ぎステアする。',
    glass: 'タンブラー',
    technique: 'ビルド'
  },
  {
    name: 'メキシカンミュール',
    base: 'テキーラ',
    strength: 'ライト',
    image_url_override: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
    ingredients: [
      { name: 'テキーラ', amount: '50ml' },
      { name: 'ライムジュース', amount: '15ml' },
      { name: 'ジンジャービア', amount: '適量' },
      { name: 'ライム', amount: '1/4個' }
    ],
    instructions: 'コッパーマグに氷を入れ、テキーラとライムジュースを注ぐ。ジンジャービアで満たし、ライムを飾る。',
    glass: 'コッパーマグ',
    technique: 'ビルド'
  }
]

cocktails_data.each do |data|
  puts "Creating cocktail: #{data[:name]}"

  base = BASE_MAP[data[:base]]
  strength = STRENGTH_MAP[data[:strength]]
  technique = TECHNIQUE_MAP[data[:technique]]

  if base.nil? || strength.nil? || technique.nil?
    raise ArgumentError, "Invalid enum mapping for #{data[:name]}"
  end

  cocktail = Cocktail.create!(
    name: data[:name],
    base: base,
    strength: strength,
    technique: technique,
    image_url_override: data[:image_url_override],
    instructions: data[:instructions],
    glass: data[:glass]
  )

  data[:ingredients].each_with_index do |ing, i|
    ingredient = Ingredient.find_or_create_by!(name: ing[:name])
    CocktailIngredient.create!(
      cocktail: cocktail,
      ingredient: ingredient,
      amount_text: ing[:amount],
      position: i + 1
    )
  end
end

puts "Seeded #{Cocktail.count} cocktails"
puts "Seeded #{Ingredient.count} unique ingredients"
puts "Seeded #{CocktailIngredient.count} relationships"
