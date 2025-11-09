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
import { Wine, GlassWater, Hammer, Droplet, Heart, Edit, X } from 'lucide-react';
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

  const primaryName = currentCocktail?.name_ja || currentCocktail?.name;
  const secondaryName = currentCocktail?.name && currentCocktail?.name !== primaryName
    ? currentCocktail.name
    : null;

  const noteText = (() => {
    if (!currentCocktail) return null;

    if (currentCocktail.description?.trim()) {
      return currentCocktail.description;
    }

    if (!currentCocktail.instructions_ja) {
      const strengthHints: Record<string, string> = {
        light: '飲みやすく、初心者の方にもおすすめです',
        medium: '程よいアルコール度数で、カクテルの味わいを楽しめます',
        strong: 'アルコール度数が高めです。ゆっくり味わってお楽しみください'
      };
      const techniqueHints: Record<string, string> = {
        build: 'グラスで直接作れるので、家でも簡単に作れます。',
        shake: 'シェイカーを使って本格的な味わいに。バーで注文するのもおすすめです。',
        stir: 'ミキシンググラスでステアして、滑らかな口当たりに。'
      };

      const hints = [`このカクテルは${strengthHints[currentCocktail.strength] ?? 'バランスの取れた味わいです'}。`];

      if (techniqueHints[currentCocktail.technique]) {
        hints.push(techniqueHints[currentCocktail.technique]);
      }

      return hints.join('');
    }

    return null;
  })();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          ref={dialogRef}
          className="w-[90vw] min-[380px]:w-[84vw] sm:w-[78vw] lg:w-[72vw] xl:w-[68vw] max-w-[960px] xl:max-w-[1024px] h-[88vh] sm:h-auto max-h-[90vh] flex flex-col p-0 gap-0 border border-gray-100 rounded-xl sm:rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] [&>button]:hidden"
          style={{
            transform: touchStart !== null && translateY > 0
              ? `translateY(${translateY}px)`
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
          <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>

          {/* Fixed Header (mobile / tablet) */}
          <DialogHeader className="text-left bg-white z-10 px-4 py-4 sm:px-6 sm:py-5 md:px-6 md:py-4 border-b border-gray-100 shrink-0 lg:hidden">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:gap-4 md:gap-5">
                  <div className="space-y-2 sm:space-y-2 md:space-y-4">
                    <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                      {primaryName}
                    </DialogTitle>
                    {secondaryName && (
                      <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium tracking-wide uppercase">{secondaryName}</p>
                    )}
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap mt-2">
                  <Badge className={`${strengthColors[currentCocktail.strength as keyof typeof strengthColors] ?? ''} px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1.5 border text-xs`}>
                    {STRENGTH_LABELS[currentCocktail.strength]}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 md:px-3 md:py-1.5 text-xs">
                    <Wine className="w-3.5 h-3.5" />
                    {BASE_LABELS[currentCocktail.base]}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-end gap-1.5 sm:gap-2">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </Button>
              </div>
              {noteText && (
                <p className="col-span-2 text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed whitespace-pre-wrap mt-1 sm:mt-1.5">
                  {noteText}
                </p>
              )}
            </div>
          </DialogHeader>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-start justify-between gap-2 px-4 md:px-4 py-3 border-b border-gray-100 bg-white shrink-0">
            <div className="space-y-2.5">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
                  {primaryName}
                </DialogTitle>
                {secondaryName && (
                  <p className="text-base text-gray-400 tracking-[0.2em] uppercase">
                    {secondaryName}
                  </p>
                )}
              </div>
              {noteText && (
                <p className="text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {noteText}
                </p>
              )}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge className={`${strengthColors[currentCocktail.strength as keyof typeof strengthColors] ?? ''} px-3 py-1 text-xs border`}>
                  {STRENGTH_LABELS[currentCocktail.strength]}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-xs">
                  <Wine className="w-3.5 h-3.5" />
                  {BASE_LABELS[currentCocktail.base]}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-xs">
                  <Hammer className="w-3.5 h-3.5" />
                  {TECHNIQUE_LABELS[currentCocktail.technique]}
                </Badge>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              {isAdmin && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditOpen(true)}
                  className="h-11 w-11 rounded-full"
                >
                  <Edit className="w-5 h-5 text-gray-600" />
                </Button>
              )}
              {onToggleFavorite && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleFavorite(currentCocktail.id)}
                  className="h-11 w-11 rounded-full shadow-sm border border-gray-100"
                >
                  <Heart
                    className={`w-6 h-6 transition-colors ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-300 hover:text-red-500'
                    }`}
                  />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-11 w-11 rounded-full"
              >
                <X className="w-6 h-6 text-gray-600" />
              </Button>
            </div>
          </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto lg:overflow-hidden overscroll-contain bg-gray-50/70 rounded-b-xl sm:rounded-b-2xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-4 pt-5 pb-6 sm:px-6 sm:pt-7 sm:pb-8 md:px-6 md:pb-10">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:gap-10">
              {/* 情報エリア（右カラム） */}
              <div className="order-2 lg:order-2 space-y-6 sm:space-y-8 lg:flex lg:flex-col lg:w-1/2 lg:max-h-[calc(88vh-16rem)] lg:overflow-y-auto lg:pr-2">

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 md:mb-5">
                    <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">材料</h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {currentCocktail.ingredients?.map((ingredient, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2.5 sm:p-3.5 md:p-4 rounded-lg sm:rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-[1.02] hover:shadow-sm"
                      >
                        <span className="text-[13px] sm:text-sm text-gray-900">{ingredient.name}</span>
                        <span className="text-gray-600 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 bg-white rounded-full text-xs sm:text-sm font-medium">
                          {ingredient.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900">作り方</h3>
                  </div>
                  <div className="bg-gray-50 p-4 sm:p-5 md:p-7 rounded-xl sm:rounded-2xl hover:bg-gray-100 transition-colors">
                    <p className="leading-relaxed text-sm  text-gray-700 whitespace-pre-wrap">
                      {currentCocktail.instructions_ja || currentCocktail.instructions}
                    </p>
                  </div>
                </div>
              </div>

              {/* ビジュアルエリア（左カラム） */}
              <div className="order-1 lg:order-1 space-y-4 sm:space-y-5 lg:flex lg:flex-col lg:w-1/2 lg:flex-shrink-0">
                <div className="relative w-full aspect-[4/3] md:aspect-[5/4] lg:aspect-[3/2] max-h-[320px] lg:max-h-[280px] rounded-2xl lg:rounded-3xl overflow-hidden bg-gray-100 shadow-sm lg:shadow-lg">
                  <ImageWithFallback
                    src={currentCocktail.image_url || ''}
                    alt={currentCocktail.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <Wine className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">ベース</p>
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{BASE_LABELS[currentCocktail.base]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                      <Hammer className="w-3.5 h-3.5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">技法</p>
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{TECHNIQUE_LABELS[currentCocktail.technique]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                      <GlassWater className="w-3.5 h-3.5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">グラス</p>
                      <p className="text-xs font-medium text-gray-900 leading-tight sm:text-sm">{currentCocktail.glass_ja || currentCocktail.glass}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/80 border border-gray-100 shadow-sm">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
                      <Droplet className="w-3.5 h-3.5 text-rose-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500">アルコール度数</p>
                      <p className="text-xs font-medium text-gray-900 sm:text-sm">{STRENGTH_LABELS[currentCocktail.strength]}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
