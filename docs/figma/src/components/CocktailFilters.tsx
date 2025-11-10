// @ts-nocheck
import { CocktailBase } from '../types/cocktail';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface CocktailFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBase: CocktailBase | null;
  onBaseChange: (base: CocktailBase | null) => void;
  ingredientSearch: string;
  onIngredientSearchChange: (query: string) => void;
}

const bases: CocktailBase[] = ['ジン', 'ラム', 'ウイスキー', 'ウォッカ', 'テキーラ', 'ビール'];

const baseIcons: Record<CocktailBase, string> = {
  'ジン': '🍸',
  'ラム': '🥃',
  'ウイスキー': '🥃',
  'ウォッカ': '🍹',
  'テキーラ': '🍋',
  'ビール': '🍺'
};

export function CocktailFilters({
  searchQuery,
  onSearchChange,
  selectedBase,
  onBaseChange,
  ingredientSearch,
  onIngredientSearchChange
}: CocktailFiltersProps) {
  return (
    <div className="space-y-8">
      {/* Name Search */}
      <div>
        <label className="block mb-3 text-gray-700">カクテル名で検索</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="マティーニ、モヒート..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-9 h-11 bg-white border-gray-200 rounded-xl"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Base Filter */}
      <div>
        <label className="block mb-3 text-gray-700">ベースで選ぶ</label>
        <div className="space-y-2">
          {bases.map((base) => (
            <button
              key={base}
              onClick={() => onBaseChange(selectedBase === base ? null : base)}
              className={`w-full p-3.5 rounded-xl border transition-all ${
                selectedBase === base
                  ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                  : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none">{baseIcons[base]}</span>
                <span className="flex-1 text-left">
                  {base}
                </span>
              </div>
            </button>
          ))}
        </div>
        {selectedBase && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBaseChange(null)}
            className="mt-3 w-full bg-white border-gray-200 hover:bg-gray-50 h-10 rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            クリア
          </Button>
        )}
      </div>

      {/* Ingredient Search */}
      <div>
        <label className="block mb-3 text-gray-700">手持ちの材料から探す</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ライム、ジン..."
            value={ingredientSearch}
            onChange={(e) => onIngredientSearchChange(e.target.value)}
            className="pl-9 pr-9 h-11 bg-white border-gray-200 rounded-xl"
          />
          {ingredientSearch && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onIngredientSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-gray-400 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
