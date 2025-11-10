import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

interface CocktailFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBases: string[];
  onBasesChange: (bases: string[]) => void;
}

const bases: { value: string; label: string; icon: string }[] = [
  { value: 'gin', label: 'ジン', icon: '🍸' },
  { value: 'rum', label: 'ラム', icon: '🍹' },
  { value: 'whisky', label: 'ウイスキー', icon: '🥃' },
  { value: 'vodka', label: 'ウォッカ', icon: '🍸' },
  { value: 'tequila', label: 'テキーラ', icon: '🍋' },
  { value: 'beer', label: 'ビール', icon: '🍺' },
  { value: 'wine', label: 'ワイン', icon: '🍷' },
];

export function CocktailFilters({
  searchQuery,
  onSearchChange,
  selectedBases,
  onBasesChange
}: CocktailFiltersProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleBaseToggle = (baseValue: string) => {
    if (selectedBases.includes(baseValue)) {
      // すでに選択されている場合は解除
      onBasesChange([]);
    } else {
      // 新しく選択（単一選択なので配列に1つだけ）
      onBasesChange([baseValue]);
    }
  };

  const handleSearchChange = (value: string) => {
    setTempSearchQuery(value);
    onSearchChange(value);
  };

  const handleSearchSubmit = () => {
    onSearchChange(tempSearchQuery.trim());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <div className="space-y-8">
      {/* Keyword Search */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          カクテル名・材料名で検索
        </label>
        <div className="flex items-center w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition">
          <Input
            type="text"
            placeholder="例: マティーニ、モヒート"
            value={tempSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none px-4 text-gray-800 placeholder-gray-400 h-12 rounded-2xl focus-visible:ring-0 focus-visible:ring-offset-0"
            ref={inputRef}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-sm hover:from-indigo-600 hover:to-blue-600 active:scale-95 transition"
            aria-label="検索"
          >
            <Search className="w-5 h-5" />
          </button>
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
                className={`w-full p-3.5 rounded-2xl border transition-all ${
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
      </div>

    </div>
  );
}
