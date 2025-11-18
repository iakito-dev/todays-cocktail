import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  getCurrentUser,
  clearAuthToken,
  updateUserProfile,
  updateUserPassword,
} from '../lib/api';
import { toast } from '../lib/toast';

// =======================================
// Types
// =======================================
interface User {
  id: number;
  email: string;
  name: string;
  admin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =======================================
// Provider
// =======================================
// アプリ全体で共有する認証状態とハンドラーを提供する
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初期化時にトークンがあれば認証状態を確認
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await getCurrentUser();
          setUser(response.data.user);
        } catch {
          // トークンが無効な場合はクリア
          clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // ログイン：API成功でユーザー情報をセット
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiLogin(email, password);
      setUser(response.data.user);
      toast.success('ログインしました');
    } finally {
      setIsLoading(false);
    }
  };

  // 新規登録：メール認証を待つため自動ログインはしない
  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await apiSignup(email, password, name);
      // メール確認が必要なため、自動ログインしない
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト：サーバー側とローカルstateをクリア
  const logout = async () => {
    setIsLoading(true);
    try {
      await apiLogout();
      setUser(null);
      toast.success('ログアウトしました');
    } finally {
      setIsLoading(false);
    }
  };

  // ユーザー名を更新して最新のユーザー情報を反映
  const updateProfile = async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('ユーザー名を入力してください');
    }
    const response = await updateUserProfile(trimmedName);
    setUser(response.data.user);
    toast.success('ユーザー名を更新しました');
  };

  // パスワード更新。サーバー側で検証に失敗した場合はエラーをそのまま伝播させる
  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    if (!currentPassword || !newPassword) {
      throw new Error('現在のパスワードと新しいパスワードを入力してください');
    }
    await updateUserPassword(currentPassword, newPassword, confirmPassword);
    toast.success('パスワードを更新しました');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: user !== null,
    isAdmin: user?.admin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
