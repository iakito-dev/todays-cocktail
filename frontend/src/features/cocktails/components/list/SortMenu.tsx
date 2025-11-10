import { useEffect, useRef, useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

// =======================================
// Props
// =======================================
// 現在のソート軸と変更ハンドラーを親から受け取る
interface SortMenuProps {
  value: 'id' | 'popular';
  onChange: (value: 'id' | 'popular') => void;
}

// =======================================
// Component
// =======================================
// 一覧の並び替えを制御するドロップダウンメニュー
export function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // メニューを開いている間のみ、外側クリックとEscキーで閉じる
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // 項目を選択したら親に通知し、メニューを閉じる
  const handleSelect = (nextValue: 'id' | 'popular') => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        type="button"
        variant="outline"
        className="h-9 bg-white border-gray-200 hover:bg-gray-50"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        並べ替え
        <ChevronDown className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-2xl border border-gray-200 bg-white shadow-lg z-50">
          <div className="py-2">
            <SortMenuItem
              active={value === 'id'}
              label="デフォルト"
              onSelect={() => handleSelect('id')}
            />
            <SortMenuItem
              active={value === 'popular'}
              label="人気順"
              onSelect={() => handleSelect('popular')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================
// Sub Component
// =======================================
// 個々のメニュー項目。active状態でスタイルを切り替える
interface SortMenuItemProps {
  active: boolean;
  label: string;
  onSelect: () => void;
}

function SortMenuItem({ active, label, onSelect }: SortMenuItemProps) {
  return (
    <button
      type="button"
      className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      <span>{label}</span>
      {active && <Check className="h-4 w-4" />}
    </button>
  );
}
