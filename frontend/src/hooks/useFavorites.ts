import { useState, useCallback } from 'react';
import type { Favorite } from '../lib/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // お気に入り一覧を取得
  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('ログインが必要です');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status?.message || 'お気に入りの取得に失敗しました');
      }

      setFavorites(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // お気に入りに追加
  const addFavorite = useCallback(async (cocktailId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('ログインが必要です');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cocktail_id: cocktailId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status?.message || 'お気に入りの追加に失敗しました');
      }

      // お気に入り一覧を再取得
      await fetchFavorites();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  // お気に入りから削除
  const removeFavorite = useCallback(async (favoriteId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('ログインが必要です');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.status?.message || 'お気に入りの削除に失敗しました');
      }

      // お気に入り一覧を再取得
      await fetchFavorites();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  // カクテルIDからお気に入りIDを取得
  const getFavoriteId = useCallback((cocktailId: number) => {
    const favorite = favorites.find(fav => fav.cocktail.id === cocktailId);
    return favorite?.id;
  }, [favorites]);

  // カクテルがお気に入りかどうかを確認
  const isFavorite = useCallback((cocktailId: number) => {
    return favorites.some(fav => fav.cocktail.id === cocktailId);
  }, [favorites]);

  // お気に入りをクリア（ログアウト時用）
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    setError(null);
  }, []);

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    getFavoriteId,
    isFavorite,
    clearFavorites,
  };
};
