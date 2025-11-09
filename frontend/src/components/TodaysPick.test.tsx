import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { TodaysPick } from './TodaysPick';

// 今日のおすすめコンポーネントが持つキャッシュ挙動を再現するための sessionStorage モック
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
})();

// 使い回すモックデータ（最低限のフィールドのみ）
const mockCocktail = {
  id: 42,
  name: 'Sample Cocktail',
  name_ja: 'サンプルカクテル',
  base: 'gin',
  strength: 'medium',
  technique: 'shake',
  description: 'Testing cocktail description',
  image_url: 'https://example.com/cocktail.jpg',
  instructions: 'Mix well',
  created_at: '2025-11-06',
  updated_at: '2025-11-06',
};

describe('TodaysPick', () => {
  beforeAll(() => {
    // ブラウザ環境での sessionStorage をテスト用に差し替え
    Object.defineProperty(window, 'sessionStorage', {
      value: sessionStorageMock,
      configurable: true,
    });
  });

  let fetchMock: ReturnType<typeof vi.fn>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    fetchMock = vi.fn();
    // 毎テストで fetch を差し替え、呼び出し回数や引数を検証
    vi.stubGlobal('fetch', fetchMock);
    sessionStorageMock.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it('fetches today’s pick, renders the result, and caches it', async () => {
    // 初回アクセス時は API 呼び出し → sessionStorage 保存まで行われることを確認
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCocktail,
    } as unknown as Response);

    const onViewDetails = vi.fn();
    render(<TodaysPick onViewDetails={onViewDetails} />);

    expect(await screen.findByText('サンプルカクテル')).toBeInTheDocument();
    expect(screen.getByText('ジン')).toBeInTheDocument();
    expect(screen.getByText('ミディアム')).toBeInTheDocument();

    // 今日の日付をキーにした sessionStorage が作成されているはず
    const todayKey = new Date().toISOString().split('T')[0];
    const cached = sessionStorage.getItem(`todays_pick_${todayKey}`);
    expect(cached).not.toBeNull();
    expect(cached && JSON.parse(cached).id).toBe(42);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // 詳細ボタンをクリックするとハンドラーにモックデータが渡される
    const user = userEvent.setup();
    const button = screen.getAllByRole('button', { name: 'レシピを見る' })[0];
    await user.click(button);

    await waitFor(() => {
      expect(onViewDetails).toHaveBeenCalledWith(mockCocktail);
    });
  });

  it('uses cached value when available and skips fetch', async () => {
    // 日付キーでキャッシュ済みなら fetch を呼ばずに描画される想定
    const todayKey = new Date().toISOString().split('T')[0];
    sessionStorage.setItem(`todays_pick_${todayKey}`, JSON.stringify(mockCocktail));

    render(<TodaysPick />);

    expect(await screen.findByText('サンプルカクテル')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows fallback message when fetch fails', async () => {
    // API がエラーを返した場合のフェイルセーフ表示
    fetchMock.mockResolvedValueOnce({
      ok: false,
    } as unknown as Response);

    render(<TodaysPick />);

    // `findByText` は DOM へ要素が表示されるまで待機してくれる
    expect(await screen.findByText('本日のおすすめカクテルを取得できませんでした。')).toBeInTheDocument();
  });
});
