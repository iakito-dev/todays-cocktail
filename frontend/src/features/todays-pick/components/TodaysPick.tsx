import { useEffect, useState } from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import type { Cocktail } from '../../../lib/types';

// =======================================
// 定数・Props
// =======================================
// APIエンドポイントと表示用の色マッピングをここで定義し、JSXの複雑さを抑える
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200',
};

interface TodaysPickProps {
  onViewDetails?: (cocktail: Cocktail) => void; // 詳細表示を親側で処理するコールバック
}

// =======================================
// Component
// =======================================
// 日替わりカクテルを取得してカードUIで紹介するトップハイライトコンポーネント
export function TodaysPick({ onViewDetails }: TodaysPickProps) {
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初回表示で1日1回のみ最新データを取得し、セッションキャッシュを活用する
  useEffect(() => {
    const fetchTodaysPick = async () => {
      try {
        // キャッシュキーを日付単位で作り、同日のリクエストをメモリから返す
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `todays_pick_${today}`;

        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            setCocktail(JSON.parse(cached));
            setLoading(false);
            return;
          } catch {
            sessionStorage.removeItem(cacheKey);
          }
        }

        const response = await fetch(
          `${API_BASE}/api/v1/cocktails/todays_pick`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch today's pick");
        }
        const data = await response.json();
        setCocktail(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysPick();
  }, []);

  // カード全体から詳細表示をトリガーし、親のダイアログに委譲
  // カード全体やCTAボタンから呼ばれ、親が詳細ダイアログを開く
  const handleClick = () => {
    if (cocktail && onViewDetails) {
      onViewDetails(cocktail);
    }
  };

  if (loading) {
    return (
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit mb-6">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 画像スケルトン：アスペクト比を固定し、レイアウトシフトを防ぐ */}
            <div className="relative aspect-square md:aspect-[4/3]">
              <Skeleton className="absolute inset-0 rounded-2xl" />
            </div>
            {/* コンテンツスケルトン：タイトル・バッジ・CTAの配置を先に示す */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-32 rounded-full" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (error || !cocktail) {
    return (
      <Card className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
        <div className="p-8 md:p-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full w-fit mb-4">
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>
          <p className="text-gray-600">
            本日のおすすめカクテルを取得できませんでした。
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="relative overflow-hidden rounded-2xl md:rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 p-4 md:p-8 lg:p-12">
        {/* Left Content：テキスト情報とCTAを縦並びで提示する */}
        <div className="flex flex-col justify-center space-y-3 md:space-y-6 order-1 md:order-1">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 md:px-4 md:py-2 rounded-full w-fit text-sm md:text-base">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
            <span className="font-medium leading-none">Today's Pick</span>
          </div>

          <div>
            <div className="space-y-1 md:space-y-2 mb-2 md:mb-4">
              <h2
                className={`${
                  (cocktail.name_ja || cocktail.name).length > 10
                    ? 'text-xl md:text-2xl lg:text-3xl'
                    : 'text-2xl md:text-3xl lg:text-4xl'
                } font-bold text-gray-900 leading-tight`}
              >
                {cocktail.name_ja || cocktail.name}
              </h2>
              {cocktail.name_ja && (
                <p
                  className={`${
                    cocktail.name.length > 20
                      ? 'text-xs md:text-base'
                      : 'text-sm md:text-lg'
                  } text-gray-500 font-semibold tracking-wider uppercase`}
                >
                  {cocktail.name}
                </p>
              )}
            </div>
            <p className="text-sm md:text-base text-gray-600 leading-relaxed line-clamp-2 md:line-clamp-3">
              {cocktail.description}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <Badge
              className={`${strengthColors[cocktail.strength as keyof typeof strengthColors]} px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm`}
            >
              {getStrengthLabel(cocktail.strength)}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white border-gray-200"
            >
              {getBaseLabel(cocktail.base)}
            </Badge>
            <Badge
              variant="outline"
              className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm bg-white border-gray-200"
            >
              {getTechniqueLabel(cocktail.technique)}
            </Badge>
          </div>

          {/* デスクトップ用ボタン：グラデーションとアイコンで主要アクションを強調する */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="hidden md:flex group w-full md:w-fit bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 md:px-6 lg:px-8 py-3 md:py-4 lg:py-6 shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
          >
            レシピを見る
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>

        {/* Right Image：ビジュアル優先の領域で、カード全体の訴求力を高める */}
        <div className="flex items-center justify-center order-2 md:order-2">
          <div className="relative group w-full">
            <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl md:rounded-2xl overflow-hidden shadow-lg">
              <ImageWithFallback
                src={cocktail.image_url || ''}
                alt={cocktail.name || 'No image available'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* モバイル用ボタン：画面幅いっぱいのCTAでタップ操作を補助する */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="md:hidden group w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 text-sm rounded-2xl order-3"
        >
          レシピを見る
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// =======================================
// Helper functions
// =======================================
// ラベルのマッピング関数を分離し、メインコンポーネントをすっきり保つ
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
