import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import type { Cocktail } from '../lib/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200'
};

export function TodaysPick() {
  const navigate = useNavigate();
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
    if (cocktail) {
      navigate(`/cocktails/${cocktail.id}`);
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit mb-4">
            <span className="text-xl">🍸</span>
            <span className="font-medium">Today's Pick</span>
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
            <span className="text-xl">🍸</span>
            <span className="font-medium">Today's Pick</span>
          </div>
          <p className="text-gray-600">本日のおすすめカクテルを取得できませんでした。</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12">
        {/* Left Content */}
        <div className="flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit">
            <span className="text-xl">🍸</span>
            <span className="font-medium">Today's Pick</span>
          </div>

          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              {cocktail.name}
            </h2>
            <p className="text-gray-600 leading-relaxed line-clamp-3">
              {cocktail.instructions}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`${strengthColors[cocktail.strength as keyof typeof strengthColors]} px-4 py-2 rounded-full text-sm font-medium border`}>
              {getStrengthLabel(cocktail.strength)}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white">
              {getBaseLabel(cocktail.base)}
            </span>
            <span className="px-4 py-2 rounded-full text-sm font-medium border border-gray-200 bg-white">
              {getTechniqueLabel(cocktail.technique)}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-fit bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg shadow-sm transition-colors font-medium inline-flex items-center gap-2"
          >
            レシピを見る
            <span>→</span>
          </button>
        </div>

        {/* Right Image */}
        <div className="flex items-center justify-center">
          <div className="relative group">
            <div className="relative aspect-square w-full max-w-sm rounded-3xl overflow-hidden shadow-lg">
              {cocktail.image_url && (
                <img
                  src={cocktail.image_url}
                  alt={cocktail.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              )}
            </div>
          </div>
        </div>
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
