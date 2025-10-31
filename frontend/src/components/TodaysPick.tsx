import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import type { Cocktail } from '../lib/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200'
};

interface TodaysPickProps {
  onViewDetails?: (cocktail: Cocktail) => void;
}

export function TodaysPick({ onViewDetails }: TodaysPickProps) {
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodaysPick = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/cocktails/todays_pick`);
        if (!response.ok) {
          throw new Error('Failed to fetch today\'s pick');
        }
        const data = await response.json();
        setCocktail(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysPick();
  }, []);

  const handleClick = () => {
    if (cocktail && onViewDetails) {
      onViewDetails(cocktail);
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit mb-4">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </Card>
    );
  }

  if (error || !cocktail) {
    return (
      <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit mb-4">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>
          <p className="text-gray-600">本日のおすすめカクテルを取得できませんでした。</p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 lg:p-12">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-3 md:space-y-6 order-1 md:order-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit text-sm md:text-base">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>

          <div>
            <div className="space-y-1 md:space-y-2 mb-2 md:mb-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight break-words">
                {cocktail.name_ja || cocktail.name}
              </h2>
              {cocktail.name_ja && (
                <p className="text-sm md:text-lg text-gray-500 font-semibold tracking-wider uppercase break-words">
                  {cocktail.name}
                </p>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-3">
              {cocktail.description || cocktail.instructions}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Badge className={`${strengthColors[cocktail.strength as keyof typeof strengthColors]} px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm`}>
              {getStrengthLabel(cocktail.strength)}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white border-gray-200">
              {getBaseLabel(cocktail.base)}
            </Badge>
            <Badge variant="outline" className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white border-gray-200">
              {getTechniqueLabel(cocktail.technique)}
            </Badge>
          </div>

          {/* デスクトップ用ボタン */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="hidden md:flex group w-full md:w-fit bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base rounded-xl"
          >
            レシピを見る
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        {/* Right Image */}
        <div className="flex items-center justify-center order-2 md:order-2">
          <div className="relative group w-full">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src={cocktail.image_url || ""}
                alt={cocktail.name || "No image available"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* モバイル用ボタン（画像の下） */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="md:hidden group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm rounded-xl order-3"
        >
          レシピを見る
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// Helper functions for labels
function getBaseLabel(base: string): string {
  const labels: Record<string, string> = {
    gin: 'ジン',
    rum: 'ラム',
    whisky: 'ウイスキー',
    vodka: 'ウォッカ',
    tequila: 'テキーラ',
    beer: 'ビール',
    wine: 'ワイン',
  };
  return labels[base] || base;
}

function getStrengthLabel(strength: string): string {
  const labels: Record<string, string> = {
    light: 'ライト',
    medium: 'ミディアム',
    strong: 'ストロング',
  };
  return labels[strength] || strength;
}

function getTechniqueLabel(technique: string): string {
  const labels: Record<string, string> = {
    build: 'ビルド',
    stir: 'ステア',
    shake: 'シェイク',
  };
  return labels[technique] || technique;
}
