# frozen_string_literal: true

puts "Seeding cocktails..."

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

cocktails = [
  { id: 1, name: 'マティーニ', base: 'ジン', strength: 'ストロング', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800', technique: 'ステア',
    instructions: 'ミキシンググラスに氷を入れ、ジンとベルモットを注ぎステアする。カクテルグラスに濾して注ぎ、オリーブを飾る。' },
  { id: 2, name: 'ジントニック', base: 'ジン', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800', technique: 'ビルド',
    instructions: 'タンブラーに氷を入れ、ジンを注ぐ。トニックウォーターで満たし、軽くステアする。ライムを絞って落とす。' },
  { id: 3, name: 'モスコミュール', base: 'ウォッカ', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', technique: 'ビルド',
    instructions: 'タンブラーに氷を入れ、ライムを絞る。ウォッカを注ぎ、ジンジャーエールで満たす。軽くステアする。' },
  { id: 4, name: 'マルガリータ', base: 'テキーラ', strength: 'ミディアム', image_url: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800', technique: 'シェイク',
    instructions: 'グラスの縁に塩をつける（スノースタイル）。シェイカーに氷と材料を入れシェイクする。グラスに注ぐ。' },
  { id: 5, name: 'モヒート', base: 'ラム', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800', technique: 'ビルド',
    instructions: 'グラスにミント、砂糖、ライムを入れ潰す。クラッシュドアイスを入れ、ラムを注ぐ。ソーダで満たし、ステアする。' },
  { id: 6, name: 'ウイスキーサワー', base: 'ウイスキー', strength: 'ミディアム', image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800', technique: 'シェイク',
    instructions: 'シェイカーに氷と材料を入れシェイクする。ロックグラスに注ぎ、レモンとチェリーを飾る。' },
  { id: 7, name: 'マンハッタン', base: 'ウイスキー', strength: 'ストロング', image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', technique: 'ステア',
    instructions: 'ミキシンググラスに氷と材料を入れステアする。カクテルグラスに濾して注ぎ、チェリーを飾る。' },
  { id: 8, name: 'コスモポリタン', base: 'ウォッカ', strength: 'ミディアム', image_url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800', technique: 'シェイク',
    instructions: 'シェイカーに氷と全ての材料を入れシェイクする。カクテルグラスに濾して注ぐ。' },
  { id: 9, name: 'ネグローニ', base: 'ジン', strength: 'ストロング', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800', technique: 'ビルド',
    instructions: 'ロックグラスに氷と材料を入れステアする。オレンジピールを絞って飾る。' },
  { id: 10, name: 'ダイキリ', base: 'ラム', strength: 'ミディアム', image_url: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800', technique: 'シェイク',
    instructions: 'シェイカーに氷と材料を入れシェイクする。カクテルグラスに濾して注ぐ。' },
  { id: 11, name: 'テキーラサンライズ', base: 'テキーラ', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800', technique: 'ビルド',
    instructions: 'タンブラーに氷を入れ、テキーラとオレンジジュースを注ぎステアする。グレナデンシロップを静かに注ぎ、グラデーションを作る。' },
  { id: 12, name: 'オールドファッションド', base: 'ウイスキー', strength: 'ストロング', image_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', technique: 'ビルド',
    instructions: 'ロックグラスに角砂糖とビターズを入れ、少量の水で溶かす。氷を入れウイスキーを注ぎステアする。オレンジピールを飾る。' },
  # 新しく beer / wine ベースを追加
  { id: 13, name: 'レッドアイ', base: 'ビール', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=800', technique: 'ビルド',
    instructions: 'グラスにビールとトマトジュースを注ぎ、軽くステアする。' },
  { id: 14, name: 'ミモザ', base: 'ワイン', strength: 'ライト', image_url: 'https://images.unsplash.com/photo-1562059390-a761a084768e?w=800', technique: 'ビルド',
    instructions: 'シャンパングラスにオレンジジュースとスパークリングワインを注ぐ。' }
]

# 既存データ削除
Cocktail.destroy_all

# データ検証
cocktails.each do |data|
  base = BASE_MAP[data[:base]]
  strength = STRENGTH_MAP[data[:strength]]
  technique = TECHNIQUE_MAP[data[:technique]]

  if base.nil? || strength.nil? || technique.nil?
    raise ArgumentError, "Invalid enum mapping for cocktail: \\#{data[:name]}"
  end

  Cocktail.create!(
    name: data[:name],
    base: base,
    strength: strength,
    technique: technique,
    image_url: data[:image_url],
    instructions: data[:instructions]
  )
end

puts "Seeded #{Cocktail.count} cocktails"
