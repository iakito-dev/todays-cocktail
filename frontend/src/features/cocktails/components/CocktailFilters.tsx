import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Input } from '../../../components/ui/input';
import { Search } from 'lucide-react';

// =======================================
// Props / 定数
// =======================================
// propsの型とベース酒の定義を事前にまとめ、JSX内の条件分岐を減らす
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

// =======================================
// Component
// =======================================
// 検索キーワードとベース酒をシンプルなUIで切り替えるフィルターコンポーネント
export function CocktailFilters({
  searchQuery,
  onSearchChange,
  selectedBases,
  onBasesChange,
}: CocktailFiltersProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();
  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);

  // ベース酒を単一選択でトグルし、再クリックで解除する
  const handleBaseToggle = (baseValue: string) => {
    if (selectedBases.includes(baseValue)) {
      onBasesChange([]);
    } else {
      onBasesChange([baseValue]);
    }
  };

  // 入力中の値を即時に反映し、親へも伝播させる
  const handleSearchChange = (value: string) => {
    setTempSearchQuery(value);
    onSearchChange(value);
  };

  // Enterキー押下時などに余分なスペースを除いて検索する
  const handleSearchSubmit = () => {
    onSearchChange(tempSearchQuery.trim());
  };

  // Enterキーで即座に検索できるよう、フォーム送信を肩代わりする
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearchSubmit();
    }
  };

  return (
    <div className="space-y-8">
      {/* Keyword Search：入力欄とアイコンボタンを横並びで配置する */}
      <div className="mb-6">
        <label
          className="block mb-2 text-sm font-medium text-gray-700"
          htmlFor={searchInputId}
        >
          カクテル名・材料名で検索
        </label>
        <div className="flex items-center w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition">
          <Input
            id={searchInputId}
            type="text"
            placeholder="マティーニ、モヒート"
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

      {/* Base Filter：単一選択のトグルリストでベース酒を切り替える */}
      <div>
        <label className="block mb-3 text-sm font-medium text-gray-700">
          ベースで選ぶ
        </label>
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
                  <span className="flex-1 text-left">{base.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
