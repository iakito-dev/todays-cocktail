import { useState, useCallback } from 'react';
import type { Favorite } from '../lib/types';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { toast } from '../components/ui/sonner';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // お気に入り一覧を取得
  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const message = 'ログインが必要です';
      setError(message);
      toast.error(message);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet('/api/v1/favorites');
      setFavorites(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // お気に入りに追加
  const addFavorite = useCallback(async (cocktailId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const message = 'ログインが必要です';
      setError(message);
      toast.error(message);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await apiPost('/api/v1/favorites', { cocktail_id: cocktailId });
      // お気に入り一覧を再取得
      await fetchFavorites();
      toast.success('お気に入りに追加しました');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchFavorites]);

  // お気に入りから削除
  const removeFavorite = useCallback(async (favoriteId: number) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const message = 'ログインが必要です';
      setError(message);
      toast.error(message);
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      await apiDelete(`/api/v1/favorites/${favoriteId}`);
      // お気に入り一覧を再取得
      await fetchFavorites();
      toast.success('お気に入りから削除しました');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      toast.error(message);
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
