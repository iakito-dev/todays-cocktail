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
  strong: 'bg-red-100 text-red-800 border-red-200',
};

export function CocktailDetailDialog({
  cocktail,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onUpdate,
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
    if (distance > 0) {
      setTranslateY(Math.min(distance, 300));
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isDownSwipe = distance > 150;
    if (isDownSwipe) onClose();
    setTranslateY(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  const primaryName = currentCocktail?.name_ja || currentCocktail?.name;
  const secondaryName =
    currentCocktail?.name && currentCocktail?.name !== primaryName
      ? currentCocktail.name
      : null;

  const noteText = (() => {
    if (!currentCocktail) return null;
    if (currentCocktail.description?.trim()) return currentCocktail.description;

    if (!currentCocktail.instructions_ja) {
      const strengthHints: Record<string, string> = {
        light: '飲みやすく、初心者の方にもおすすめです',
        medium: '程よいアルコール度数で、カクテルの味わいを楽しめます',
        strong: 'アルコール度数が高めです。ゆっくり味わってお楽しみください',
      };
      const techniqueHints: Record<string, string> = {
        build: 'グラスで直接作れるので、家でも簡単に作れます。',
        shake: 'シェイカーを使って本格的な味わいに。バーで注文するのもおすすめです。',
        stir: 'ミキシンググラスでステアして、滑らかな口当たりに。',
      };
      const hints = [
        `このカクテルは${
          strengthHints[currentCocktail.strength] ?? 'バランスの取れた味わいです'
        }。`,
      ];
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
          size="full"
          className="!max-w-none w-[96vw] sm:w-[90vw] lg:w-[84vw] xl:w-[78vw] 2xl:w-[72vw] max-w-[1400px] max-h-[calc(100dvh-2rem)] flex flex-col p-0 border border-gray-100 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] bg-white overflow-hidden [&>button]:hidden"
          style={{
            transform:
              touchStart !== null && translateY > 0
                ? `translateY(${translateY}px)`
                : undefined,
            transition: touchStart === null ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {!currentCocktail ? (
            <div className="p-4 sm:p-6 md:p-8 space-y-6">
              <Skeleton className="h-8 sm:h-10 w-3/4 rounded-2xl" />
              <Skeleton className="h-5 sm:h-6 w-1/2 rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
              </div>
              <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            </div>
          ) : (
            <>
              <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              <DialogHeader className="bg-white z-10 px-4 sm:px-6 md:px-8 py-4 sm:py-5 border-b border-gray-100 text-left">
                <div className="relative w-full">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between pr-12">
                    <div className="space-y-2.5 sm:space-y-3">
                      {secondaryName && (
                        <p className="pl-px text-[11px] sm:text-xs uppercase tracking-[0.3em] text-gray-400 font-semibold">
                          {secondaryName}
                        </p>
                      )}
                      <DialogTitle className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-gray-900 leading-snug">
                        {primaryName}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <Badge
                          className={`${
                            strengthColors[
                              currentCocktail.strength as keyof typeof strengthColors
                            ] ?? ''
                          } px-3.5 py-1 text-[13px] sm:text-sm rounded-full tracking-tight border`}
                        >
                          {STRENGTH_LABELS[currentCocktail.strength]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1.5 px-3.5 py-1 text-[13px] sm:text-sm rounded-full font-medium border-gray-200"
                        >
                          <Wine className="w-3.5 h-3.5" />
                          {BASE_LABELS[currentCocktail.base]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1.5 px-3.5 py-1 text-[13px] sm:text-sm rounded-full font-medium border-gray-200"
                        >
                          <Hammer className="w-3.5 h-3.5" />
                          {TECHNIQUE_LABELS[currentCocktail.technique]}
                        </Badge>
                      </div>
                      {noteText && (
                        <p className="text-sm sm:text-base lg:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {noteText}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-1.5 sm:top-2 right-0 flex gap-1.5 sm:gap-2">
                    {isAdmin && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditOpen(true)}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                      </Button>
                    )}
                    {onToggleFavorite && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleFavorite(currentCocktail.id)}
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-gray-400 hover:text-red-500"
                      >
                        <Heart
                          className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors ${
                            isFavorite ? 'fill-red-500 text-red-500' : ''
                          }`}
                        />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full text-gray-500 hover:bg-gray-50"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  </div>
                </div>
              </DialogHeader>

              <div
                ref={scrollRef}
                className="flex-1 flex flex-col lg:flex-row bg-gray-50/80 overflow-y-auto lg:overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* 左カラム */}
                <div className="lg:w-1/2 flex flex-col space-y-5 px-4 sm:px-6 md:px-8 py-5 bg-white lg:sticky lg:top-0 lg:max-h-[calc(100dvh-12rem)]">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[3/2] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_15px_35px_rgba(15,23,42,0.12)]">
                    <ImageWithFallback
                      src={currentCocktail.image_url || ''}
                      alt={currentCocktail.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      {
                        icon: <Wine className="w-4 h-4 text-blue-600" />,
                        label: 'ベース',
                        value: BASE_LABELS[currentCocktail.base],
                      },
                      {
                        icon: <Hammer className="w-4 h-4 text-orange-600" />,
                        label: '技法',
                        value: TECHNIQUE_LABELS[currentCocktail.technique],
                      },
                      {
                        icon: <GlassWater className="w-4 h-4 text-indigo-600" />,
                        label: 'グラス',
                        value:
                          currentCocktail.glass_ja || currentCocktail.glass,
                      },
                      {
                        icon: <Droplet className="w-4 h-4 text-rose-600" />,
                        label: 'アルコール度数',
                        value: STRENGTH_LABELS[currentCocktail.strength],
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-900">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右カラム */}
                <div className="flex-1 overflow-y-visible lg:overflow-y-auto px-4 sm:px-6 md:px-8 lg:pl-4 lg:pr-8 py-6 sm:py-8 lg:max-h-[calc(100dvh-12rem)]">
                  <div className="space-y-6 sm:space-y-7">
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                          <h3 className="text-sm font-semibold text-gray-900">
                            材料
                          </h3>
                        </div>
                        <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">
                          INGREDIENTS
                        </p>
                      </div>
                      <div className="mt-4 divide-y divide-gray-100">
                        {currentCocktail.ingredients?.map((ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                          >
                            <span className="text-sm text-gray-900 leading-relaxed">
                              {ingredient.name}
                            </span>
                            <span className="text-sm text-gray-600 tabular-nums min-w-[72px] text-right">
                              {ingredient.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 sm:px-5 sm:py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-sm font-semibold text-gray-900">
                          作り方
                        </h3>
                      </div>
                      <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentCocktail.instructions_ja ||
                          currentCocktail.instructions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

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
