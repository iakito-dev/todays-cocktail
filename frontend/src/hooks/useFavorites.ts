import { useState, useCallback } from 'react';
import type { Favorite } from '../lib/types';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { toast } from '../lib/toast';

// =======================================
// Hook
// =======================================
// お気に入りの取得・追加・削除をまとめたアプリ共通のロジック
export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ローカルストレージからトークンを取得し、なければトーストで通知
  const requireToken = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      const message = 'ログインが必要です';
      setError(message);
      toast.error(message);
      return null;
    }
    return token;
  }, []);

  // お気に入り一覧を取得
  const fetchFavorites = useCallback(async () => {
    if (!requireToken()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiGet('/api/v1/favorites');
      setFavorites(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [requireToken]);

  // お気に入りに追加
  const addFavorite = useCallback(
    async (cocktailId: number) => {
      if (!requireToken()) {
        return false;
      }

      setError(null);

      try {
        const response = await apiPost('/api/v1/favorites', {
          cocktail_id: cocktailId,
        });
        const favoriteData = response?.data;

        if (favoriteData?.id && favoriteData?.cocktail) {
          const createdAt =
            typeof favoriteData.created_at === 'string'
              ? favoriteData.created_at
              : new Date().toISOString();

          setFavorites((prev) => {
            const exists = prev.find(
              (fav) => fav.cocktail.id === favoriteData.cocktail.id,
            );
            if (exists) {
              return prev.map((fav) =>
                fav.cocktail.id === favoriteData.cocktail.id
                  ? {
                      id: favoriteData.id,
                      cocktail: {
                        ...favoriteData.cocktail,
                        is_favorited: true,
                      },
                      created_at: createdAt,
                    }
                  : fav,
              );
            }

            return [
              {
                id: favoriteData.id,
                cocktail: { ...favoriteData.cocktail, is_favorited: true },
                created_at: createdAt,
              },
              ...prev,
            ];
          });
        } else {
          await fetchFavorites();
        }

        toast.success('お気に入りに追加しました');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(message);
        toast.error(message);
        return false;
      }
    },
    [fetchFavorites, requireToken],
  );

  // お気に入りから削除
  const removeFavorite = useCallback(
    async (favoriteId: number) => {
      if (!requireToken()) {
        return false;
      }

      setError(null);

      try {
        await apiDelete(`/api/v1/favorites/${favoriteId}`);
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
        toast.success('お気に入りから削除しました');
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'エラーが発生しました';
        setError(message);
        toast.error(message);
        return false;
      }
    },
    [requireToken],
  );

  // カクテルIDからお気に入りIDを取得
  const getFavoriteId = useCallback(
    (cocktailId: number) => {
      const favorite = favorites.find((fav) => fav.cocktail.id === cocktailId);
      return favorite?.id;
    },
    [favorites],
  );

  // カクテルがお気に入りかどうかを確認
  const isFavorite = useCallback(
    (cocktailId: number) => {
      return favorites.some((fav) => fav.cocktail.id === cocktailId);
    },
    [favorites],
  );

  // ログアウト時などにお気に入りキャッシュを破棄
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
