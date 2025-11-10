import type { Cocktail } from '../lib/types';
import { useState, useRef, useEffect } from 'react';
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

const MAX_DRAG_DISTANCE = 360;
const CLOSE_THRESHOLD = 150;

const getProvidedText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : null;
};

const BASE_STORIES: Record<string, string> = {
  gin: 'ハーバルなジンの香りが澄んだ余韻を生み、シトラスの清涼感が心地よく続きます。',
  rum: 'トロピカルなラムの甘みとスパイスが重なり、やわらかな南国の空気を感じさせます。',
  whisky: '熟成したウイスキーの厚みがしっとり広がり、樽香が穏やかな余裕を与えます。',
  vodka: 'ピュアなウォッカの透明感が素材の味を引き立て、すっきりとした後味に仕上がります。',
  tequila: 'アガベ由来の力強い香りにライムの爽快さが重なり、陽気で鮮烈な印象を残します。',
  beer: '麦芽の旨味と軽やかな泡が同時に広がり、食事とも合わせやすい柔らかさがあります。',
  wine: '果実味豊かなワインのアロマがふくらみ、酸味と渋みのバランスが上品に整います。',
};

const STRENGTH_STORIES: Record<string, string> = {
  light: '軽やかな飲み口で最初の一杯にも選びやすく、リフレッシュしたい時にぴったりです。',
  medium: '甘味とアルコールの輪郭がちょうど良く、ゆっくり味がほどけていきます。',
  strong: 'しっかりとしたアルコールの厚みがあり、落ち着いた夜に寄り添う存在感があります。',
};

const TECHNIQUE_STORIES: Record<string, string> = {
  build: 'グラスの中で材料を重ねることで、香りが穏やかに立ち上がり素材の輪郭を感じられます。',
  stir: '氷でしっかりステアすることで、透明感のある口当たりと澄んだ味わいに仕上がります。',
  shake: 'シェイカーに空気を含ませながら振ることで、ふくよかで冷たい一体感が生まれます。',
};

const buildDefaultDescription = (cocktail: Cocktail | null) => {
  if (!cocktail) return null;
  const baseStory = BASE_STORIES[cocktail.base] ?? '素材の持つ香りを素直に引き出し、口いっぱいに優雅な余韻が広がります。';
  const strengthStory = STRENGTH_STORIES[cocktail.strength] ?? '飲み進めるほどに調和が増し、余白のある味わいになります。';
  const techniqueStory = TECHNIQUE_STORIES[cocktail.technique] ?? '丁寧な仕上げによって、香りと温度が最適なバランスに整います。';
  return [
    baseStory,
    strengthStory,
    techniqueStory,
    '静かな時間にも、特別なひとときを演出したい時にも寄り添ってくれる一杯です。',
  ].join(' ');
};

const buildDefaultInstructions = (cocktail: Cocktail | null) => {
  if (!cocktail) return '';
  const glassLabel = cocktail.glass_ja || cocktail.glass || 'グラス';
  const baseLabel = BASE_LABELS[cocktail.base] || 'スピリッツ';

  const techniqueStep = (() => {
    switch (cocktail.technique) {
      case 'stir':
        return `ミキシンググラスに氷を入れ、${baseLabel}と甘味、ビターズを加えて静かにステアし香りと温度を整えます。`;
      case 'shake':
        return `シェイカーに${baseLabel}と果汁、シロップを入れてしっかり冷えるまで振り、空気を含ませて滑らかに仕上げます。`;
      default:
        return `${glassLabel}に氷を満たし、${baseLabel}と副材料を順に注いで軽くステアしながら全体を馴染ませます。`;
    }
  })();

  return `${techniqueStep} 香りがまとまったら${glassLabel}に注ぎ、お好みで柑橘のピールやハーブを飾って完成です。`;
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
  const touchStartRef = useRef<number | null>(null);
  const lastTouchRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const translateYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const scheduleTranslate = (value: number) => {
    translateYRef.current = value;
    if (typeof window === 'undefined') {
      setTranslateY(value);
      return;
    }
    if (animationFrameRef.current) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setTranslateY(translateYRef.current);
      animationFrameRef.current = null;
    });
  };

  const getEasedDistance = (distance: number) => {
    if (distance <= 0) return 0;
    const clamped = Math.min(distance, MAX_DRAG_DISTANCE);
    const progress = clamped / MAX_DRAG_DISTANCE;
    return (1 - Math.pow(1 - progress, 2.2)) * MAX_DRAG_DISTANCE;
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current && typeof window !== 'undefined') {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

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
      lastTouchRef.current = null;
      touchStartRef.current = e.targetTouches[0].clientY;
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    const currentTouch = e.targetTouches[0].clientY;
    lastTouchRef.current = currentTouch;
    const distance = currentTouch - touchStartRef.current;
    if (distance > 0) {
      if (distance > 6) {
        e.preventDefault();
      }
      scheduleTranslate(getEasedDistance(distance));
    } else {
      scheduleTranslate(0);
    }
  };

  const handleTouchEnd = () => {
    const start = touchStartRef.current;
    const end = lastTouchRef.current;
    setIsDragging(false);
    touchStartRef.current = null;
    lastTouchRef.current = null;
    if (start !== null && end !== null) {
      const distance = end - start;
      if (distance > CLOSE_THRESHOLD) {
        onClose();
        scheduleTranslate(0);
        return;
      }
    }
    scheduleTranslate(0);
  };

  const primaryName = currentCocktail?.name_ja || currentCocktail?.name;
  const secondaryName =
    currentCocktail?.name && currentCocktail?.name !== primaryName
      ? currentCocktail.name
      : null;

  const noteText =
    getProvidedText(currentCocktail?.description) ??
    buildDefaultDescription(currentCocktail);

  const instructionsText =
    getProvidedText(currentCocktail?.instructions_ja) ??
    getProvidedText(currentCocktail?.instructions) ??
    buildDefaultInstructions(currentCocktail);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          ref={dialogRef}
          size="full"
          className="!max-w-none w-[92vw] sm:w-[84vw] lg:w-[74vw] xl:w-[68vw] 2xl:w-[62vw] max-w-[1400px] max-h-[calc(100dvh-6rem)] flex flex-col p-2 sm:p-4 border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] bg-white overflow-hidden [&>button]:hidden"
          style={{
            transform: `translate(-50%, calc(-50% + ${translateY}px))`,
            transition: isDragging
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease-out',
            opacity: isDragging ? 0.98 : 1,
            willChange: 'transform, opacity',
          }}
        >
          {!currentCocktail ? (
            <div className="p-2 sm:p-6 md:p-8 space-y-6">
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

              <DialogHeader className="bg-white z-10 px-2 sm:px-5 md:px-8 py-3 sm:py-5 border-b border-gray-100 text-left">
                <div className="relative w-full">
                  <div className="flex flex-col gap-4 lg:flex-row lg:justify-between pr-2 sm:pr-4 lg:pr-12">
                    <div className="space-y-2.5 sm:space-y-3">
                      {secondaryName && (
                        <p className="pl-px text-sm uppercase tracking-[0.3em] text-gray-400 font-semibold">
                          {secondaryName}
                        </p>
                      )}
                      <DialogTitle className="text-2xl sm:text-3xl lg:text-[34px] font-semibold text-gray-900 leading-snug">
                        {primaryName}
                      </DialogTitle>
                      {noteText && (
                        <p className="text-sm sm:text-base lg:text-base text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {noteText}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center  gap-2.5 pt-1 ">
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
                className="flex-1 flex flex-col lg:flex-row bg-white overflow-y-auto lg:overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
              >
                {/* 左カラム */}
                <div className="lg:w-1/2 flex flex-col space-y-5 px-2 sm:px-5 md:px-8 py-4 bg-white lg:sticky lg:top-0 lg:max-h-[calc(100dvh-12rem)]">
                  <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[3/2] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_15px_35px_rgba(15,23,42,0.12)]">
                    <ImageWithFallback
                      src={currentCocktail.image_url || ''}
                      alt={currentCocktail.name}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* ==== Glass & Technique Section ==== */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      {
                        icon: (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Wine className="w-5 h-5 text-blue-600" />
                          </div>
                        ),
                        label: 'ベース',
                        value: BASE_LABELS[currentCocktail.base],
                      },
                      {
                        icon: (
                          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <Hammer className="w-5 h-5 text-orange-600" />
                          </div>
                        ),
                        label: '技法',
                        value: TECHNIQUE_LABELS[currentCocktail.technique],
                      },
                      {
                        icon: (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <GlassWater className="w-5 h-5 text-indigo-600" />
                          </div>
                        ),
                        label: 'グラス',
                        value: currentCocktail.glass_ja || currentCocktail.glass,
                      },
                      {
                        icon: (
                          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                            <Droplet className="w-5 h-5 text-rose-600" />
                          </div>
                        ),
                        label: 'アルコール度数',
                        value: STRENGTH_LABELS[currentCocktail.strength],
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                      >
                        {item.icon}
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-500">
                            {item.label}
                          </p>
                          <p className="text-sm text-gray-900 font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 右カラム */}
                <div className="flex-1 overflow-y-visible lg:overflow-y-auto px-2 sm:px-6 md:px-8 lg:pl-4 lg:pr-8 py-5 sm:py-8 mb-5  lg:max-h-[calc(100dvh-12rem)]">
                  <div className="space-y-6 sm:space-y-7">
                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                          <h3 className="text-base font-semibold text-gray-900">
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

                    <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
                        <h3 className="text-base font-semibold text-gray-900">
                          作り方
                        </h3>
                      </div>
                      <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {instructionsText}
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
