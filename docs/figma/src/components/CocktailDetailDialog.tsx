import { Cocktail } from '../types/cocktail';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Badge } from './ui/badge';
import { Wine, GlassWater, Hammer, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CocktailDetailDialogProps {
  cocktail: Cocktail | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (cocktailId: string) => void;
}

const strengthColors = {
  'ライト': 'bg-green-100 text-green-800 border-green-200',
  'ミディアム': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'ストロング': 'bg-red-100 text-red-800 border-red-200'
};

export function CocktailDetailDialog({
  cocktail,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite
}: CocktailDetailDialogProps) {
  if (!cocktail) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-4xl mb-3 text-gray-900">
                {cocktail.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${strengthColors[cocktail.strength]} px-3 py-1`}>
                  {cocktail.strength}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                  <Wine className="w-3 h-3" />
                  {cocktail.base}
                </Badge>
              </div>
            </div>
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => onToggleFavorite(cocktail.id)}
                className="hover:bg-gray-100 rounded-full w-12 h-12 p-0"
              >
                <Heart
                  className={`w-6 h-6 transition-colors ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'
                  }`}
                />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Image */}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <ImageWithFallback
              src={cocktail.image}
              alt={cocktail.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Glass and Technique */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <GlassWater className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-gray-500">グラス</div>
                <div className="text-gray-900">{cocktail.glass}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-gray-500">技法</div>
                <div className="text-gray-900">{cocktail.technique}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Ingredients */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-gray-900">材料</h3>
            </div>
            <div className="space-y-2">
              {cocktail.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-900">{ingredient.name}</span>
                  <span className="text-gray-600 px-3 py-1 bg-white rounded-full">
                    {ingredient.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Instructions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full" />
              <h3 className="text-gray-900">作り方</h3>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="leading-relaxed text-gray-700">
                {cocktail.instructions}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="mb-2 text-blue-900">初心者の方へ</h4>
                <p className="text-blue-800 leading-relaxed">
                  このカクテルは{cocktail.strength === 'ライト' ? '飲みやすく、初心者の方にもおすすめです' : cocktail.strength === 'ミディアム' ? '程よいアルコール度数で、カクテルの味わいを楽しめます' : 'アルコール度数が高めです。ゆっくり味わってお楽しみください'}。
                  {cocktail.technique === 'ビルド' && 'グラスで直接作れるので、家でも簡単に作れます。'}
                  {cocktail.technique === 'シェイク' && 'シェイカーを使って本格的な味わいに。バーで注文するのもおすすめです。'}
                  {cocktail.technique === 'ステア' && 'ミキシンググラスでステアして、滑らかな口当たりに。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
