import type { Cocktail } from '../lib/types';
import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';
import { Separator } from './ui/separator';
import { Wine, GlassWater, Hammer, Heart, Edit, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './ImageWithFallback';
import { EditCocktailDialog } from './EditCocktailDialog';
import { useAuth } from '../hooks/useAuth';

interface CocktailDetailDialogProps {
  cocktail: Cocktail | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (cocktailId: number) => void;
  onUpdate?: (updatedCocktail: Cocktail) => void;
}

// 日本語ラベルのマッピング
const BASE_LABELS: Record<string, string> = {
  gin: 'ジン',
  rum: 'ラム',
  whisky: 'ウイスキー',
  vodka: 'ウォッカ',
  tequila: 'テキーラ',
  beer: 'ビール',
  wine: 'ワイン',
};

const STRENGTH_LABELS: Record<string, string> = {
  light: 'ライト',
  medium: 'ミディアム',
  strong: 'ストロング',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  build: 'ビルド',
  stir: 'ステア',
  shake: 'シェイク',
};

const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200'
};

export function CocktailDetailDialog({
  cocktail,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onUpdate
}: CocktailDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCocktail, setCurrentCocktail] = useState(cocktail);
  const { isAdmin } = useAuth();

  // スワイプダウンで閉じる機能
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(0);

  // cocktailが変更されたら更新
  if (cocktail && cocktail.id !== currentCocktail?.id) {
    setCurrentCocktail(cocktail);
  }

  const handleUpdateSuccess = (updatedCocktail: Cocktail) => {
    setCurrentCocktail(updatedCocktail);
    onUpdate?.(updatedCocktail);
  };

  // スワイプダウン処理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    // スクロール位置が最上部の場合のみスワイプを有効に
    if (scrollRef.current.scrollTop === 0) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const currentTouch = e.targetTouches[0].clientY;
    setTouchEnd(currentTouch);

    const distance = currentTouch - touchStart;
    // 下方向のみ、かつ一定距離まで追従
    if (distance > 0) {
      setTranslateY(Math.min(distance, 300)); // 最大300pxまで移動
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 150; // 150px以上下にスワイプした場合

    if (isDownSwipe) {
      onClose();
    }

    // リセット
    setTranslateY(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          ref={dialogRef}
          className="w-[95vw] sm:w-[90vw] max-w-2xl h-[90vh] sm:h-auto max-h-[90vh] flex flex-col p-0 gap-0 border-gray-200 [&>button]:hidden"
          style={{
            transform: touchStart !== null && translateY > 0
              ? `translate(-50%, calc(-50% + ${translateY}px))`
              : undefined,
            transition: touchStart === null ? 'transform 0.3s ease-out' : 'none'
          }}
        >
          {!currentCocktail ? (
            // ローディング状態
            <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <Skeleton className="h-8 sm:h-10 w-3/4" />
                <Skeleton className="h-5 sm:h-6 w-1/2" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
              </div>
              <div className="relative w-full aspect-[16/9]">
                <Skeleton className="absolute inset-0 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-3">
                <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ) : (
            // コンテンツ表示
            <>
          {/* スワイプインジケーター（モバイルのみ） */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Fixed Header */}
          <DialogHeader className="text-left sticky top-0 bg-white z-10 p-4 sm:p-6 md:p-8 pb-3 sm:pb-4 md:pb-6 border-b border-gray-100 shrink-0">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1 min-w-0">
                <div className="space-y-1.5 sm:space-y-2 md:space-y-3 mb-2.5 sm:mb-3 md:mb-4">
                  <DialogTitle className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                    {currentCocktail.name_ja || currentCocktail.name}
                  </DialogTitle>
                  {currentCocktail.name_ja && (
                    <p className="text-xs sm:text-sm md:text-lg text-gray-500 font-medium tracking-wide uppercase">{currentCocktail.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Badge className={`${strengthColors[currentCocktail.strength as keyof typeof strengthColors] ?? ''} px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 border text-xs`}>
                    {STRENGTH_LABELS[currentCocktail.strength]}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 text-xs">
                    <Wine className="w-3 h-3" />
                    {BASE_LABELS[currentCocktail.base]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 shrink-0">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditOpen(true)}
                    className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-full"
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </Button>
                )}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFavorite(currentCocktail.id)}
                    className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-full"
                  >
                    <Heart
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    />
                  </Button>
                )}
                {/* 閉じるボタン */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </Button>
              </div>
            </div>
          </DialogHeader>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">

          {/* カクテル画像 */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={currentCocktail.image_url || ''}
              alt={currentCocktail.name}
              className="object-cover w-full h-full"
            />
          </div>

          {/* Glass and Technique */}
          <div className="space-y-2 sm:space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <GlassWater className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">グラス</div>
                <div className="text-sm sm:text-base font-medium text-gray-900 leading-tight">{currentCocktail.glass_ja || currentCocktail.glass}</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Hammer className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-gray-500 mb-0.5 sm:mb-1">技法</div>
                <div className="text-sm sm:text-base font-medium text-gray-900 leading-tight">{TECHNIQUE_LABELS[currentCocktail.technique]}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
              <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
              <h3 className="font-semibold text-base sm:text-lg text-gray-900">材料</h3>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {currentCocktail.ingredients?.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="text-sm sm:text-base text-gray-900">{ingredient.name}</span>
                  <span className="text-gray-600 px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 bg-white rounded-full text-xs sm:text-sm font-medium">
                    {ingredient.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
              <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
              <h3 className="font-semibold text-base sm:text-lg text-gray-900">作り方</h3>
            </div>
            <div className="bg-gray-50 p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors">
              <p className="leading-relaxed text-sm sm:text-base text-gray-700 whitespace-pre-wrap">
                {currentCocktail.instructions_ja || currentCocktail.instructions}
              </p>
            </div>
          </div>

          {/* Description - AI生成の説明文、または初心者向けtips */}
          {currentCocktail.description ? (
            <div className="bg-blue-50 p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-200 transition-all hover:shadow-sm">
              <div className="flex items-start gap-3 sm:gap-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-blue-900">Note</h4>
                  <p className="text-blue-800 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                    {currentCocktail.description}
                  </p>
                </div>
              </div>
            </div>
          ) : !currentCocktail.instructions_ja && (
            <div className="bg-blue-50 p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl border border-blue-100 hover:border-blue-200 transition-all hover:shadow-sm">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="text-xl sm:text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base text-blue-900">Note</h4>
                  <p className="text-blue-800 leading-relaxed text-sm sm:text-base">
                    このカクテルは{currentCocktail.strength === 'light' ? '飲みやすく、初心者の方にもおすすめです' : currentCocktail.strength === 'medium' ? '程よいアルコール度数で、カクテルの味わいを楽しめます' : 'アルコール度数が高めです。ゆっくり味わってお楽しみください'}。
                    {currentCocktail.technique === 'build' && 'グラスで直接作れるので、家でも簡単に作れます。'}
                    {currentCocktail.technique === 'shake' && 'シェイカーを使って本格的な味わいに。バーで注文するのもおすすめです。'}
                    {currentCocktail.technique === 'stir' && 'ミキシンググラスでステアして、滑らかな口当たりに。'}
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      {isAdmin && currentCocktail && (
        <EditCocktailDialog
          cocktail={currentCocktail}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
