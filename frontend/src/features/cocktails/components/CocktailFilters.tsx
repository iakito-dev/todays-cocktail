import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { BookOpen, Info, Search, X } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';

interface CocktailFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedBases: string[];
  onBasesChange: (bases: string[]) => void;
  selectedTechniques: string[];
  onTechniquesChange: (techniques: string[]) => void;
  selectedStrengths: string[];
  onStrengthsChange: (strengths: string[]) => void;
  showTodaysPick: boolean;
  onToggleTodaysPick: (value: boolean) => void;
  className?: string;
}

const baseOptions = [
  { value: 'gin', label: 'ジン', icon: '🍸' },
  { value: 'rum', label: 'ラム', icon: '🍹' },
  { value: 'whisky', label: 'ウイスキー', icon: '🥃' },
  { value: 'vodka', label: 'ウォッカ', icon: '🍸' },
  { value: 'tequila', label: 'テキーラ', icon: '🍋' },
  { value: 'wine', label: 'ワイン', icon: '🍷' },
];

const techniqueOptions = [
  {
    value: 'build',
    label: 'ビルド',
    description: '材料をグラスに直接注いで作る、最もシンプルな技法。',
  },
  {
    value: 'stir',
    label: 'ステア',
    description:
      '氷を入れたミキシンググラスで静かに混ぜて冷やす技法。クリアな味わいを保ちたいカクテルに使われる。',
  },
  {
    value: 'shake',
    label: 'シェイク',
    description:
      'シェイカーで強く振って、すばやく冷やしながら混ぜる技法。香りや泡立ちを引き出したいときに使われる。',
  },
];

const strengthOptions = [
  { value: 'light', label: 'ライト' },
  { value: 'medium', label: 'ミディアム' },
  { value: 'strong', label: 'ストロング' },
];

export function CocktailFilters({
  searchQuery,
  onSearchChange,
  selectedBases,
  onBasesChange,
  selectedTechniques,
  onTechniquesChange,
  selectedStrengths,
  onStrengthsChange,
  showTodaysPick,
  onToggleTodaysPick,
  className,
}: CocktailFiltersProps) {
  const [tempSearchQuery, setTempSearchQuery] = useState(searchQuery);
  const searchInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleBaseToggle = (value: string) => {
    onBasesChange(selectedBases.includes(value) ? [] : [value]);
  };

  const handleTechniqueToggle = (value: string) => {
    onTechniquesChange(selectedTechniques.includes(value) ? [] : [value]);
  };

  const handleStrengthToggle = (value: string) => {
    onStrengthsChange(selectedStrengths.includes(value) ? [] : [value]);
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
    <div
      className={cn(
        'space-y-6',
        'md:rounded-3xl md:border md:border-gray-200 md:bg-gray-50 md:p-6 md:shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-2 text-gray-900">
        <BookOpen className="h-5 w-5 text-blue-500" aria-hidden />
        <span className="text-base font-semibold">カクテル図鑑</span>
      </div>
      <div>
        <label
          className="mb-2 block text-sm text-gray-700"
          htmlFor={searchInputId}
        >
          カクテル名・材料で検索
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id={searchInputId}
            type="text"
            placeholder="マティーニ、モヒート"
            value={tempSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-12 w-full rounded-2xl border-gray-200 bg-white pl-10 pr-[64px] text-xs text-gray-900 md:text-sm"
            ref={inputRef}
          />
          {tempSearchQuery ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange('')}
              className="absolute right-14 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-white p-0 text-gray-400 shadow hover:text-gray-900"
              aria-label="クリア"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow hover:brightness-110"
            aria-label="検索"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      <FilterBadgeSection
        title="ベースで選ぶ"
        options={baseOptions}
        selectedValues={selectedBases}
        onToggle={handleBaseToggle}
      />

      <FilterBadgeSection
        title="カクテル技法で選ぶ"
        options={techniqueOptions}
        selectedValues={selectedTechniques}
        onToggle={handleTechniqueToggle}
        infoContent={
          <dl className="space-y-3">
            {techniqueOptions.map((technique) => (
              <div key={technique.value}>
                <dt className="text-xs font-semibold text-gray-900">
                  {technique.label}
                </dt>
                {technique.description ? (
                  <dd className="mt-1 text-[11px] leading-relaxed text-gray-600">
                    {technique.description}
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
        }
      />

      <FilterBadgeSection
        title="アルコール度数で選ぶ"
        options={strengthOptions}
        selectedValues={selectedStrengths}
        onToggle={handleStrengthToggle}
      />

      <div className="flex items-center justify-between rounded-2xl bg-transparent px-1 py-2">
        <p className="text-sm text-gray-900">今日のおすすめを表示</p>
        <button
          type="button"
          onClick={() => onToggleTodaysPick(!showTodaysPick)}
          aria-pressed={showTodaysPick}
          aria-label="今日のおすすめを表示"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            showTodaysPick
              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
              : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
              showTodaysPick ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}

type FilterBadgeOption = {
  value: string;
  label: string;
  icon?: ReactNode;
  description?: string;
};

interface FilterBadgeSectionProps {
  title: string;
  options: FilterBadgeOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  infoContent?: ReactNode;
}

function FilterBadgeSection({
  title,
  options,
  selectedValues,
  onToggle,
  infoContent,
}: FilterBadgeSectionProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1 text-sm text-gray-700">
        <p>{title}</p>
        {infoContent ? (
          <InfoTooltip label={`${title}の説明`}>{infoContent}</InfoTooltip>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={isSelected}
              className={cn(
                'rounded-2xl border px-4 py-2 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
                isSelected
                  ? 'border-transparent bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
              )}
            >
              <span className="flex items-center gap-2">
                {option.icon ? (
                  <span aria-hidden className="text-lg">
                    {option.icon}
                  </span>
                ) : null}
                <span>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface InfoTooltipProps {
  label: string;
  children: ReactNode;
}

function InfoTooltip({ label, children }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={contentId}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="rounded-full p-1 text-gray-400 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      >
        <Info className="h-4 w-4" aria-hidden />
      </button>
      <div
        id={contentId}
        role="tooltip"
        className={cn(
          'absolute left-1/2 top-full z-20 mt-3 w-64 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-lg transition-opacity duration-150',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        {children}
      </div>
    </div>
  );
}
