import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFavorites } from './useFavorites';

// Toast の呼び出し内容を検証するため UI 層を単純なモックに差し替える
vi.mock('../components/ui/sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from '../components/ui/sonner';
const mockedToast = toast as unknown as {
  success: Mock;
  error: Mock;
  info: Mock;
};

// API 通信をモックし、HTTP レスポンスパターンを自在に差し替えられるようにする
const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.fetch = mockFetch as any;

// 認証トークンの有無による分岐を再現するための localStorage モック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites', () => {
  beforeEach(() => {
    // 各ケースでモックが混ざらないように初期化
    mockFetch.mockClear();
    localStorageMock.clear();
    mockedToast.success.mockClear();
    mockedToast.error.mockClear();
    mockedToast.info.mockClear();
  });

  describe('fetchFavorites', () => {
    it('トークンがない場合はエラーを設定する', async () => {
      // 未ログイン状態では API を呼ばずにエラーメッセージを返す想定
      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        // hook の内部状態が非同期で変わるため、ここで await しながら検証する
        expect(result.current.error).toBe('ログインが必要です');
      });
      expect(result.current.favorites).toEqual([]);
      expect(mockedToast.error).toHaveBeenCalledWith('ログインが必要です');
    });

    it('正常にお気に入り一覧を取得する', async () => {
      // 一覧取得成功時に状態が更新され、トーストが出ないことを検証
      const mockFavorites = [
        {
          id: 1,
          cocktail: {
            id: 10,
            name: 'マティーニ',
            base: 'gin',
            strength: 'strong',
            technique: 'stir',
            image_url: null,
            instructions: null,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          },
          created_at: '2023-01-01',
        },
      ];

      localStorageMock.setItem('auth_token', 'test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockFavorites }),
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        expect(result.current.favorites).toEqual(mockFavorites);
        expect(result.current.error).toBeNull();
      });
      expect(mockedToast.error).not.toHaveBeenCalled();
    });

    it('APIエラー時にエラーを設定する', async () => {
      // API 側がエラーを返したときのエラーメッセージとトースト
      localStorageMock.setItem('auth_token', 'test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ status: { message: 'エラーが発生しました' } }),
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('エラーが発生しました');
      });
      expect(mockedToast.error).toHaveBeenCalledWith('エラーが発生しました');
    });
  });

  describe('addFavorite', () => {
    it('トークンがない場合はfalseを返す', async () => {
      // 認証前はお気に入り登録できない仕様
      const { result } = renderHook(() => useFavorites());

      let success = false;
      await act(async () => {
        success = await result.current.addFavorite(10);
      });

      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe('ログインが必要です');
      });
      expect(mockedToast.error).toHaveBeenCalledWith('ログインが必要です');
    });

    it('正常にお気に入りを追加する', async () => {
      // POST 成功後に一覧へ新規要素が追加されるかを確認
      localStorageMock.setItem('auth_token', 'test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({
          data: {
            id: 1,
            cocktail: { id: 10, name: 'Test' },
          },
        }),
      });

      const { result } = renderHook(() => useFavorites());

      let success = false;
      await act(async () => {
        success = await result.current.addFavorite(10);
      });

      expect(success).toBe(true);
      await waitFor(() => {
        // fetch -> state 更新 が完了するまで待ってから値を確認する
        expect(result.current.favorites).toHaveLength(1);
        expect(result.current.favorites[0].cocktail.id).toBe(10);
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/favorites'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
          body: JSON.stringify({ cocktail_id: 10 }),
        })
      );
      expect(mockedToast.success).toHaveBeenCalledWith('お気に入りに追加しました');
    });
  });

  describe('removeFavorite', () => {
    it('正常にお気に入りを削除する', async () => {
      // DELETE 成功後に一覧から要素が取り除かれるかを確認
      localStorageMock.setItem('auth_token', 'test-token');

      const mockFavorite = {
        id: 1,
        cocktail: {
          id: 10,
          name: 'マティーニ',
          base: 'gin',
          strength: 'strong',
          technique: 'stir',
          image_url: null,
          instructions: null,
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        },
        created_at: '2023-01-01',
      };

      // fetchFavorites -> removeFavorite の順でレスポンスを用意
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [mockFavorite] }),
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: { message: 'お気に入りから削除しました。' },
        }),
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });
      await waitFor(() => {
        expect(result.current.favorites).toHaveLength(1);
      });

      let success = false;
      await act(async () => {
        success = await result.current.removeFavorite(1);
      });

      expect(success).toBe(true);
      await waitFor(() => {
        // DELETE 実行後、ステートの配列が空になったかを追跡
        expect(result.current.favorites).toHaveLength(0);
      });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/favorites/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(mockedToast.success).toHaveBeenCalledWith('お気に入りから削除しました');
    });
  });

  describe('isFavorite', () => {
    it('お気に入りに含まれている場合はtrueを返す', async () => {
      // メモ化された一覧から特定 ID を高速に判定できるか
      const mockFavorites = [
        {
          id: 1,
          cocktail: {
            id: 10,
            name: 'マティーニ',
            base: 'gin',
            strength: 'strong',
            technique: 'stir',
            image_url: null,
            instructions: null,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          },
          created_at: '2023-01-01',
        },
      ];

      localStorageMock.setItem('auth_token', 'test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockFavorites }),
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        expect(result.current.isFavorite(10)).toBe(true);
        expect(result.current.isFavorite(999)).toBe(false);
      });
    });
  });

  describe('clearFavorites', () => {
    it('お気に入りをクリアする', async () => {
      // ログアウトなどのタイミングで状態を初期化できるか
      const mockFavorites = [
        {
          id: 1,
          cocktail: {
            id: 10,
            name: 'マティーニ',
            base: 'gin',
            strength: 'strong',
            technique: 'stir',
            image_url: null,
            instructions: null,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          },
          created_at: '2023-01-01',
        },
      ];

      localStorageMock.setItem('auth_token', 'test-token');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockFavorites }),
      });

      const { result } = renderHook(() => useFavorites());

      await act(async () => {
        await result.current.fetchFavorites();
      });

      await waitFor(() => {
        // 一度お気に入りが1件存在する状態を作ってから clear の挙動を確かめる
        expect(result.current.favorites.length).toBe(1);
      });

      act(() => {
        result.current.clearFavorites();
      });

      await waitFor(() => {
        // クリア後は配列が空＆エラーもリセットされていることを想定
        expect(result.current.favorites).toEqual([]);
        expect(result.current.error).toBeNull();
      });
    });
  });
});
