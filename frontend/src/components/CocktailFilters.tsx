import { Input } from './ui/input';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface CocktailFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBases: string[];
  onBasesChange: (bases: string[]) => void;
  ingredientSearch: string;
  onIngredientSearchChange: (query: string) => void;
}

const bases: { value: string; label: string; icon: string }[] = [
  { value: 'gin', label: 'ジン', icon: '🍸' },
  { value: 'rum', label: 'ラム', icon: '🥃' },
  { value: 'whisky', label: 'ウイスキー', icon: '🥃' },
  { value: 'vodka', label: 'ウォッカ', icon: '🍹' },
  { value: 'tequila', label: 'テキーラ', icon: '🍋' },
  { value: 'beer', label: 'ビール', icon: '🍺' },
  { value: 'wine', label: 'ワイン', icon: '🍷' },
];

export function CocktailFilters({
  searchQuery,
  onSearchChange,
  selectedBases,
  onBasesChange,
  ingredientSearch,
  onIngredientSearchChange
}: CocktailFiltersProps) {
  const handleBaseToggle = (baseValue: string) => {
    if (selectedBases.includes(baseValue)) {
      // すでに選択されている場合は解除
      onBasesChange([]);
    } else {
      // 新しく選択（単一選択なので配列に1つだけ）
      onBasesChange([baseValue]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Name Search */}
      <div>
        <label className="block mb-3 text-sm font-medium text-gray-700">カクテル名で検索</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="モヒート、Mojito、マティーニ..."
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
        <label className="block mb-3 text-sm font-medium text-gray-700">ベースで選ぶ</label>
        <div className="space-y-2">
          {bases.map((base) => {
            const isSelected = selectedBases.includes(base.value);
            return (
              <button
                key={base.value}
                onClick={() => handleBaseToggle(base.value)}
                className={`w-full p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-sm'
                    : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl leading-none">{base.icon}</span>
                  <span className="flex-1 text-left">
                    {base.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        {selectedBases.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBasesChange([])}
            className="mt-3 w-full bg-white border-gray-200 hover:bg-gray-50 h-10 rounded-xl"
          >
            <X className="w-4 h-4 mr-2" />
            選択を解除
          </Button>
        )}
      </div>

      {/* Ingredient Search */}
      <div>
        <label className="block mb-3 text-sm font-medium text-gray-700">手持ちの材料から探す</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="ライム、ジン... (カンマで区切り)"
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
