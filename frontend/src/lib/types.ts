export interface Ingredient {
  name: string;
  name_en?: string;
  amount: string;
  amount_en?: string;
}

export interface Cocktail {
  id: number;
  name: string;
  name_ja?: string;
  base: 'gin' | 'rum' | 'whisky' | 'vodka' | 'tequila' | 'beer' | 'wine';
  strength: 'light' | 'medium' | 'strong';
  technique: 'build' | 'stir' | 'shake';
  image_url: string | null;
  instructions: string | null;
  glass?: string;
  glass_ja?: string;
  description?: string;
  ingredients?: Ingredient[];
  is_favorited?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Favorite {
  id: number;
  cocktail: Cocktail;
  created_at: string;
}

