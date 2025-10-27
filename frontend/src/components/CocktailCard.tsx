import type { Cocktail } from '../lib/types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Wine } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

interface CocktailCardProps {
  cocktail: Cocktail;
  onViewDetails: (cocktail: Cocktail) => void;
}

const strengthColors = {
  'light': 'bg-green-100 text-green-800 border-green-200',
  'medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'strong': 'bg-red-100 text-red-800 border-red-200'
};

const strengthLabels = {
  'light': 'ライト',
  'medium': 'ミディアム',
  'strong': 'ストロング'
};

const baseLabels = {
  'gin': 'ジン',
  'rum': 'ラム',
  'whisky': 'ウイスキー',
  'vodka': 'ウォッカ',
  'tequila': 'テキーラ',
  'beer': 'ビール',
  'wine': 'ワイン'
};

const techniqueLabels = {
  'build': 'ビルド',
  'stir': 'ステア',
  'shake': 'シェイク'
};

export function CocktailCard({ cocktail, onViewDetails }: CocktailCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border bg-white border-gray-200"
      onClick={() => onViewDetails(cocktail)}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={cocktail.image_url || ''}
          alt={cocktail.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge className={`${strengthColors[cocktail.strength] ?? strengthColors['light']} shadow-sm`}>
            {strengthLabels[cocktail.strength] ?? strengthLabels['light']}
          </Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="mb-3 text-gray-900 font-semibold">{cocktail.name}</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Wine className="w-4 h-4" />
            <span>{baseLabels[cocktail.base]}</span>
          </div>
          <span className="text-gray-500">{techniqueLabels[cocktail.technique as keyof typeof techniqueLabels] ?? cocktail.technique}</span>
        </div>
      </CardContent>
    </Card>
  );
}
