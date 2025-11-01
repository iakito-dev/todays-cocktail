import type { Cocktail } from '../lib/types';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Wine, GlassWater, Hammer, Heart, Edit } from 'lucide-react';
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

  // cocktailが変更されたら更新
  if (cocktail && cocktail.id !== currentCocktail?.id) {
    setCurrentCocktail(cocktail);
  }

  const handleUpdateSuccess = (updatedCocktail: Cocktail) => {
    setCurrentCocktail(updatedCocktail);
    onUpdate?.(updatedCocktail);
  };

  if (!currentCocktail) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 [&>button]:hidden">
          {/* Fixed Header */}
          <DialogHeader className="text-left sticky top-0 bg-white z-10 p-6 sm:p-8 pb-4 sm:pb-6 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  <DialogTitle className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                    {currentCocktail.name_ja || currentCocktail.name}
                  </DialogTitle>
                  {currentCocktail.name_ja && (
                    <p className="text-sm sm:text-lg text-gray-500 font-medium tracking-wide uppercase">{currentCocktail.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${strengthColors[currentCocktail.strength as keyof typeof strengthColors] ?? ''} px-2.5 py-1 sm:px-3 sm:py-1.5 border text-xs sm:text-sm`}>
                    {STRENGTH_LABELS[currentCocktail.strength]}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm">
                    <Wine className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {BASE_LABELS[currentCocktail.base]}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditOpen(true)}
                    className="hover:bg-gray-100 rounded-full"
                  >
                    <Edit className="w-5 h-5 text-gray-600" />
                  </Button>
                )}
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleFavorite(currentCocktail.id)}
                    className="hover:bg-gray-100 rounded-full"
                  >
                    <Heart
                      className={`w-12 h-12 transition-colors ${
                        isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                      }`}
                    />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 pt-4 sm:pt-6">
          <div className="space-y-8">
          {/* Image */}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <ImageWithFallback
              src={currentCocktail.image_url || ''}
              alt={currentCocktail.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Glass and Technique */}
          <div className="grid grid-cols-2 gap-5">
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center">
                <GlassWater className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">グラス</div>
                <div className="text-base font-medium text-gray-900">{currentCocktail.glass_ja || currentCocktail.glass}</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">技法</div>
                <div className="text-base font-medium text-gray-900">{TECHNIQUE_LABELS[currentCocktail.technique]}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="font-semibold text-lg text-gray-900">材料</h3>
            </div>
            <div className="space-y-3">
              {currentCocktail.ingredients?.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all hover:scale-[1.02] hover:shadow-sm"
                >
                  <span className="text-base text-gray-900">{ingredient.name}</span>
                  <span className="text-gray-600 px-4 py-1.5 bg-white rounded-full text-sm font-medium">
                    {ingredient.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="font-semibold text-lg text-gray-900">作り方</h3>
            </div>
            <div className="bg-gray-50 p-7 rounded-2xl hover:bg-gray-100 transition-colors">
              <p className="leading-relaxed text-base text-gray-700 whitespace-pre-wrap">
                {currentCocktail.instructions_ja || currentCocktail.instructions}
              </p>
            </div>
          </div>

          {/* Description or Tips */}
          {!currentCocktail.instructions_ja && (
            <div className="bg-blue-50 p-7 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all hover:shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-2xl">💡</div>
                <div>
                  <h4 className="font-semibold mb-3 text-base text-blue-900">初心者の方へ</h4>
                  <p className="text-blue-800 leading-relaxed text-base">
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
      </DialogContent>
    </Dialog>

    {/* 編集ダイアログ */}
    {isAdmin && (
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
