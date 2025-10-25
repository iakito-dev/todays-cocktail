export interface Cocktail {
  id: number;
  name: string;
  base: 'gin' | 'rum' | 'whisky' | 'vodka' | 'tequila' | 'beer' | 'wine';
  strength: 'light' | 'medium' | 'strong';
  technique: 'build' | 'stir' | 'shake';
  image_url: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

