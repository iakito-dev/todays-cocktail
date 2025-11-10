// @ts-nocheck
import { Cocktail } from '../types/cocktail';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TodaysPickProps {
  cocktail: Cocktail;
  onViewDetails: (cocktail: Cocktail) => void;
}

const strengthColors = {
  'ライト': 'bg-green-100 text-green-800 border-green-200',
  'ミディアム': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'ストロング': 'bg-red-100 text-red-800 border-red-200'
};

export function TodaysPick({ cocktail, onViewDetails }: TodaysPickProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-50 to-white border border-gray-200 shadow-sm">

      <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit">
            <Sparkles className="w-4 h-4" />
            <span>Today's Pick</span>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              {cocktail.name}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {cocktail.instructions.slice(0, 100)}...
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={`${strengthColors[cocktail.strength]} px-4 py-2`}>
              {cocktail.strength}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-white">
              {cocktail.base}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 bg-white">
              {cocktail.technique}
            </Badge>
          </div>

          <Button
            onClick={() => onViewDetails(cocktail)}
            className="w-fit bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 shadow-sm"
          >
            レシピを見る
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Right Image */}
        <div className="flex items-center justify-center">
          <div className="relative group">
            <div className="relative aspect-square w-full max-w-sm rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src={cocktail.image}
                alt={cocktail.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
