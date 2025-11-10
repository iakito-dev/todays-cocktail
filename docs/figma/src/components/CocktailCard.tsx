// @ts-nocheck
import { Cocktail } from '../types/cocktail';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Heart, Wine } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CocktailCardProps {
  cocktail: Cocktail;
  onViewDetails: (cocktail: Cocktail) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (cocktailId: string) => void;
}

const strengthColors = {
  'ライト': 'bg-green-100 text-green-800 border-green-200',
  'ミディアム': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'ストロング': 'bg-red-100 text-red-800 border-red-200'
};

const baseColors = {
  'ジン': 'bg-white border-gray-200',
  'ラム': 'bg-white border-gray-200',
  'ウイスキー': 'bg-white border-gray-200',
  'ウォッカ': 'bg-white border-gray-200',
  'テキーラ': 'bg-white border-gray-200',
  'ビール': 'bg-white border-gray-200'
};

export function CocktailCard({ cocktail, onViewDetails, isFavorite, onToggleFavorite }: CocktailCardProps) {
  return (
    <Card className={`group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border ${baseColors[cocktail.base]}`}>
      <div className="relative aspect-[4/3] overflow-hidden" onClick={() => onViewDetails(cocktail)}>
        <ImageWithFallback
          src={cocktail.image}
          alt={cocktail.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3">
          <Badge className={`${strengthColors[cocktail.strength]} shadow-sm`}>
            {cocktail.strength}
          </Badge>
        </div>
        {onToggleFavorite && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(cocktail.id);
            }}
            className="absolute top-3 left-3 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full w-9 h-9 p-0 shadow-sm"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </Button>
        )}
      </div>
      <CardContent className="p-5" onClick={() => onViewDetails(cocktail)}>
        <h3 className="mb-3 text-gray-900">{cocktail.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Wine className="w-4 h-4" />
            <span>{cocktail.base}</span>
          </div>
          <span className="text-gray-500">{cocktail.technique}</span>
        </div>
      </CardContent>
    </Card>
  );
}
