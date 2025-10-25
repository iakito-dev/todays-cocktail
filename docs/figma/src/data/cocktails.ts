import { Cocktail } from '../types/cocktail';

export const cocktailsData: Cocktail[] = [
  {
    id: '1',
    name: 'マティーニ',
    base: 'ジン',
    strength: 'ストロング',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
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
    id: '2',
    name: 'ジントニック',
    base: 'ジン',
    strength: 'ライト',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
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
    id: '3',
    name: 'モスコミュール',
    base: 'ウォッカ',
    strength: 'ライト',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
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
    id: '4',
    name: 'マルガリータ',
    base: 'テキーラ',
    strength: 'ミディアム',
    image: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
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
    id: '5',
    name: 'モヒート',
    base: 'ラム',
    strength: 'ライト',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800',
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
    id: '6',
    name: 'ウイスキーサワー',
    base: 'ウイスキー',
    strength: 'ミディアム',
    image: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=800',
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
    id: '7',
    name: 'マンハッタン',
    base: 'ウイスキー',
    strength: 'ストロング',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
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
    id: '8',
    name: 'コスモポリタン',
    base: 'ウォッカ',
    strength: 'ミディアム',
    image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=800',
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
    id: '9',
    name: 'ネグローニ',
    base: 'ジン',
    strength: 'ストロング',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800',
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
    id: '10',
    name: 'ダイキリ',
    base: 'ラム',
    strength: 'ミディアム',
    image: 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800',
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
    id: '11',
    name: 'テキーラサンライズ',
    base: 'テキーラ',
    strength: 'ライト',
    image: 'https://images.unsplash.com/photo-1582824042461-cc2c9e5c6e4d?w=800',
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
    id: '12',
    name: 'オールドファッションド',
    base: 'ウイスキー',
    strength: 'ストロング',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800',
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
];
