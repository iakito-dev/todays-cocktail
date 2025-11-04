import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFavorites } from './useFavorites';

// Mock fetch
const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
globalThis.fetch = mockFetch as any;

// Mock localStorage
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
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  describe('fetchFavorites', () => {
    it('トークンがない場合はエラーを設定する', async () => {
      const { result } = renderHook(() => useFavorites());

      await result.current.fetchFavorites();

      await waitFor(() => {
        expect(result.current.error).toBe('ログインが必要です');
      });
      expect(result.current.favorites).toEqual([]);
    });

    it('正常にお気に入り一覧を取得する', async () => {
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

      await result.current.fetchFavorites();

      await waitFor(() => {
        expect(result.current.favorites).toEqual(mockFavorites);
        expect(result.current.error).toBeNull();
      });
    });

    it('APIエラー時にエラーを設定する', async () => {
      localStorageMock.setItem('auth_token', 'test-token');
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ status: { message: 'エラーが発生しました' } }),
      });

      const { result } = renderHook(() => useFavorites());

      await result.current.fetchFavorites();

      await waitFor(() => {
        expect(result.current.error).toBe('エラーが発生しました');
      });
    });
  });

  describe('addFavorite', () => {
    it('トークンがない場合はfalseを返す', async () => {
      const { result } = renderHook(() => useFavorites());

      const success = await result.current.addFavorite(10);

      expect(success).toBe(false);
      await waitFor(() => {
        expect(result.current.error).toBe('ログインが必要です');
      });
    });

    it('正常にお気に入りを追加する', async () => {
      localStorageMock.setItem('auth_token', 'test-token');

      // addFavorite用のモック
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

      // fetchFavorites用のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      const success = await result.current.addFavorite(10);

      expect(success).toBe(true);
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
    });
  });

  describe('removeFavorite', () => {
    it('正常にお気に入りを削除する', async () => {
      localStorageMock.setItem('auth_token', 'test-token');

      // removeFavorite用のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          status: { message: 'お気に入りから削除しました。' },
        }),
      });

      // fetchFavorites用のモック
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      });

      const { result } = renderHook(() => useFavorites());

      const success = await result.current.removeFavorite(1);

      expect(success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/favorites/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('isFavorite', () => {
    it('お気に入りに含まれている場合はtrueを返す', async () => {
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

      await result.current.fetchFavorites();

      await waitFor(() => {
        expect(result.current.isFavorite(10)).toBe(true);
        expect(result.current.isFavorite(999)).toBe(false);
      });
    });
  });

  describe('clearFavorites', () => {
    it('お気に入りをクリアする', async () => {
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

      await result.current.fetchFavorites();

      await waitFor(() => {
        expect(result.current.favorites.length).toBe(1);
      });

      result.current.clearFavorites();

      await waitFor(() => {
        expect(result.current.favorites).toEqual([]);
        expect(result.current.error).toBeNull();
      });
    });
  });
});
