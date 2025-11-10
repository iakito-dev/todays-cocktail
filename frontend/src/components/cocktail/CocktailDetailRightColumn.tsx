import type { Cocktail } from '../../lib/types';
import { cn } from '../../lib/utils';

interface CocktailDetailRightColumnProps {
  cocktail: Cocktail;
  instructionsText: string;
  className?: string;
}

export function CocktailDetailRightColumn({
  cocktail,
  instructionsText,
  className,
}: CocktailDetailRightColumnProps) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-visible lg:overflow-y-auto px-2 sm:px-5 md:px-8 lg:px-4 py-4 sm:py-6 lg:pt-4 lg:pb-6 mb-5 lg:max-h-[calc(100dvh-12rem)]',
        className
      )}
    >
      <div className="space-y-6 sm:space-y-7">
        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">材料</h3>
            </div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">INGREDIENTS</p>
          </div>
          <div className="mt-4 divide-y divide-gray-100">
            {cocktail.ingredients?.map((ingredient, index) => (
              <div
                key={`${ingredient.name}-${index}`}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-gray-900 leading-relaxed">{ingredient.name}</span>
                <span className="text-sm text-gray-600 tabular-nums min-w-[72px] text-right">
                  {ingredient.amount}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4 sm:px-5 sm:py-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 sm:h-6 bg-blue-500 rounded-full" />
              <h3 className="text-base font-semibold text-gray-900">作り方</h3>
            </div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-300">RECIPE</p>
          </div>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{instructionsText}</p>
        </div>
      </div>
    </div>
  );
}
