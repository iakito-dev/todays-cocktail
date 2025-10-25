export type CocktailBase = 'ジン' | 'ラム' | 'ウイスキー' | 'ウォッカ' | 'テキーラ' | 'ビール';

export type AlcoholStrength = 'ライト' | 'ミディアム' | 'ストロング';

export type TechniqueType = 'シェイク' | 'ビルド' | 'ステア' | 'ブレンド';

export interface Ingredient {
  name: string;
  amount: string;
}

export interface Cocktail {
  id: string;
  name: string;
  base: CocktailBase;
  strength: AlcoholStrength;
  image: string;
  ingredients: Ingredient[];
  instructions: string;
  glass: string;
  technique: TechniqueType;
}
