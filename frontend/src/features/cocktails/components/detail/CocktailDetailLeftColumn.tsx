import { GlassWater, Hammer, Droplet, Wine } from 'lucide-react';
import type { Cocktail } from '../../../../lib/types';
import { ImageWithFallback } from '../../../../components/common/ImageWithFallback';
import { cn } from '../../../../lib/utils';
import {
  BASE_LABELS,
  STRENGTH_LABELS,
  TECHNIQUE_LABELS,
} from './cocktailUtils';

// =======================================
// Props
// =======================================
interface CocktailDetailLeftColumnProps {
  cocktail: Cocktail;
  className?: string;
}

// =======================================
// Component
// =======================================
// 画像と基本属性カードを縦並びで表示するレフトカラム
export function CocktailDetailLeftColumn({
  cocktail,
  className,
}: CocktailDetailLeftColumnProps) {
  return (
    <div
      className={cn(
        'lg:w-1/2 flex flex-col space-y-5 px-2 sm:px-5 md:px-8 py-4 bg-white lg:sticky lg:top-0 lg:max-h-[calc(100dvh-12rem)]',
        className,
      )}
    >
      {/* メイン画像：アスペクト比を切り替えつつシャドウで強調 */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[5/4] lg:aspect-[3/2] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_15px_35px_rgba(15,23,42,0.12)]">
        <ImageWithFallback
          src={cocktail.image_url || ''}
          alt={cocktail.name}
          className="object-cover w-full h-full"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>

      {/* 属性カード：ベース/技法/グラス/強さを2列グリッドで並べる */}
      <div className="grid grid-cols-2 gap-3.5">
        {[
          {
            icon: (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Wine className="w-5 h-5 text-blue-600" />
              </div>
            ),
            label: 'ベース',
            value: BASE_LABELS[cocktail.base],
          },
          {
            icon: (
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-orange-600" />
              </div>
            ),
            label: '技法',
            value: TECHNIQUE_LABELS[cocktail.technique],
          },
          {
            icon: (
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <GlassWater className="w-5 h-5 text-indigo-600" />
              </div>
            ),
            label: 'グラス',
            value: cocktail.glass_ja || cocktail.glass,
          },
          {
            icon: (
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Droplet className="w-5 h-5 text-rose-600" />
              </div>
            ),
            label: 'アルコール度数',
            value: STRENGTH_LABELS[cocktail.strength],
          },
        ].map((item) => (
          <div
            key={item.label}
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
  );
}
