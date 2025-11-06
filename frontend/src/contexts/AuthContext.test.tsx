import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';
import { login as apiLogin, signup as apiSignup, logout as apiLogout, getCurrentUser, clearAuthToken } from '../lib/api';

// 認証 API に対する依存をすべてモック化し、
// 「コンテキスト内部でどの関数が呼ばれるか」だけをテストできるようにする
vi.mock('../lib/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  logout: vi.fn(),
  getCurrentUser: vi.fn(),
  clearAuthToken: vi.fn(),
}));

// localStorage をテスト環境で差し替える
// これによりブラウザがなくてもトークンの保存・削除の挙動を再現できる
const localStorageMock = (() => {
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
  };
})();

// window.localStorage を上書き。configurable: true にすることでテスト後に戻せる
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

// vi.mock で生成された関数は unknown として扱われるため、Mock 型にキャストして使いやすくする
const mockedLogin = apiLogin as unknown as Mock;
const mockedSignup = apiSignup as unknown as Mock;
const mockedLogout = apiLogout as unknown as Mock;
const mockedGetCurrentUser = getCurrentUser as unknown as Mock;
const mockedClearAuthToken = clearAuthToken as unknown as Mock;

describe('AuthProvider', () => {
  beforeEach(() => {
    // 各テストを独立させるためにモックの呼び出し履歴と localStorage をクリア
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('initializes without calling getCurrentUser when no token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetCurrentUser).not.toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('fetches current user when token exists', async () => {
    // トークンが残っているケースでは `/users/me` 呼び出しが行われる想定
    localStorage.setItem('auth_token', 'token-123');
    mockedGetCurrentUser.mockResolvedValueOnce({
      data: {
        user: { id: 1, email: 'user@example.com', name: 'User', admin: false },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1);
    expect(result.current.user?.email).toBe('user@example.com');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('clears invalid token if getCurrentUser fails', async () => {
    // 期限切れトークンのときにクライアント側で破棄されるかを確認
    localStorage.setItem('auth_token', 'token-123');
    mockedGetCurrentUser.mockRejectedValueOnce(new Error('invalid token'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedClearAuthToken).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
  });

  it('logs in and stores the user', async () => {
    // ログイン成功時にユーザー情報・ admin フラグが更新されることを検証
    mockedLogin.mockResolvedValueOnce({
      data: { user: { id: 2, email: 'login@example.com', name: 'Login User', admin: true } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('login@example.com', 'password');
    });

    expect(mockedLogin).toHaveBeenCalledWith('login@example.com', 'password');
    expect(result.current.user?.id).toBe(2);
    expect(result.current.isAdmin).toBe(true);
  });

  it('signs up and keeps user unauthenticated', async () => {
    // サインアップ後はメール確認待ちのため未ログイン状態を維持する仕様
    mockedSignup.mockResolvedValueOnce({});

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.signup('new@example.com', 'password', 'New User');
    });

    expect(mockedSignup).toHaveBeenCalledWith('new@example.com', 'password', 'New User');
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('logs out and clears user state', async () => {
    // ログアウト API が呼ばれたあと状態が初期化されることを確認
    mockedLogin.mockResolvedValueOnce({
      data: { user: { id: 2, email: 'login@example.com', name: 'Login User', admin: false } },
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login('login@example.com', 'password');
    });

    expect(result.current.user).not.toBeNull();

    await act(async () => {
      await result.current.logout();
    });

    expect(mockedLogout).toHaveBeenCalledTimes(1);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
