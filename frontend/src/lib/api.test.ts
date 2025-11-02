import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  apiGet,
  apiPost,
  setAuthToken,
  clearAuthToken,
  fetchCocktails,
  fetchCocktail,
  login,
  signup,
  logout,
  getCurrentUser
} from './api';

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

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('apiGet', () => {
    it('GETリクエストを正常に送信する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const result = await apiGet('/test');

      expect(result).toEqual({ data: 'test' });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('認証トークンがある場合、Authorizationヘッダーを含める', async () => {
      localStorageMock.setItem('auth_token', 'test-token');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiGet('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('エラーレスポンスの場合、エラーをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Not Found',
      });

      await expect(apiGet('/test')).rejects.toThrow();
    });
  });

  describe('apiPost', () => {
    it('POSTリクエストを正常に送信する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiPost('/test', { data: 'test' });

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
        })
      );
    });
  });

  describe('setAuthToken / clearAuthToken', () => {
    it('認証トークンを保存・削除できる', () => {
      setAuthToken('my-token');
      expect(localStorageMock.getItem('auth_token')).toBe('my-token');

      clearAuthToken();
      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });
  });

  describe('fetchCocktails', () => {
    it('カクテル一覧を取得する', async () => {
      const mockResponse = {
        cocktails: [
          {
            id: 1,
            name: 'マティーニ',
            base: 'gin',
            technique: 'stir',
            strength: 'strong',
            image_url: null,
            instructions: null,
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          },
        ],
        meta: {
          current_page: 1,
          per_page: 20,
          total_count: 1,
          total_pages: 1,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchCocktails();

      expect(result).toEqual(mockResponse);
    });

    it('クエリパラメータを含めて取得する', async () => {
      const mockResponse = {
        cocktails: [],
        meta: {
          current_page: 1,
          per_page: 20,
          total_count: 0,
          total_pages: 0,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await fetchCocktails({ q: 'mojito', base: 'rum', ingredients: 'mint', page: 1, per_page: 20 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cocktails?'),
        expect.any(Object),
      );
      const url = (mockFetch.mock.calls[0][0] as string);
      expect(url).toContain('q=mojito');
      expect(url).toContain('base=rum');
      expect(url).toContain('ingredients=mint');
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=20');
    });
  });

  describe('fetchCocktail', () => {
    it('特定のカクテルを取得する', async () => {
      const mockCocktail = {
        id: 1,
        name: 'マティーニ',
        base: 'gin',
        strength: 'strong',
        technique: 'stir',
        image_url: null,
        instructions: null,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
        ingredients: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCocktail }),
      } as Response);

      const result = await fetchCocktail(1);

      expect(result).toEqual({ data: mockCocktail });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/cocktails/1'),
        expect.any(Object)
      );
    });
  });

  describe('login', () => {
    it('ログインに成功する', async () => {
      const mockResponse = {
        status: { code: 200, message: 'ログインしました。' },
        data: {
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token123' : null),
        },
        json: async () => mockResponse,
      });

      const result = await login('test@example.com', 'password');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('auth_token')).toBe('token123');
    });
  });

  describe('signup', () => {
    it('サインアップに成功する', async () => {
      const mockResponse = {
        status: { code: 201, message: 'アカウントを作成しました。' },
        data: {
          user: { id: 1, email: 'test@example.com', name: 'Test User' },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (key: string) => (key === 'Authorization' ? 'Bearer token456' : null),
        },
        json: async () => mockResponse,
      });

      const result = await signup('test@example.com', 'password', 'Test User');

      expect(result).toEqual(mockResponse);
      expect(localStorageMock.getItem('auth_token')).toBe('token456');
    });
  });

  describe('logout', () => {
    it('ログアウトに成功する', async () => {
      localStorageMock.setItem('auth_token', 'Bearer token123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: { message: 'ログアウトしました。' } }),
      });

      await logout();

      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('現在のユーザー情報を取得する', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      };

      localStorageMock.setItem('auth_token', 'Bearer token123');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { user: mockUser } }),
      });

      const result = await getCurrentUser();

      expect(result.data.user).toEqual(mockUser);
    });
  });
});

