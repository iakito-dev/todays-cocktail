import { useEffect, useMemo, useState } from 'react';
import { fetchCocktails, type CocktailQuery } from '../../../lib/api';
import type { Cocktail } from '../../../lib/types';
import { useDebounce } from '../../../hooks/useDebounce';

export interface UseCocktailSearchOptions {
  query: string;
  bases: string[];
  techniques: string[];
  strengths: string[];
  page: number;
  perPage: number;
  sort: 'id' | 'popular';
}

interface UseCocktailSearchResult {
  cocktails: Cocktail[] | null;
  totalPages: number;
  totalCount: number;
  error: string | null;
  isLoading: boolean;
  debouncedQuery: string;
  updateLocalCocktail: (cocktail: Cocktail) => void;
}

// =======================================
// Hook
// =======================================
// カクテル一覧の検索・キャッシュ制御をまとめたカスタムフック
export function useCocktailSearch(
  options: UseCocktailSearchOptions,
): UseCocktailSearchResult {
  const { query, bases, techniques, strengths, page, perPage, sort } = options;
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 300);

  // クエリ条件をもとにセッションキャッシュ用のキーを生成
  const cacheKey = useMemo(() => {
    return `cocktails_${JSON.stringify({
      q: debouncedQuery,
      base: bases,
      technique: techniques,
      strength: strengths,
      page,
      per_page: perPage,
      sort,
    })}`;
  }, [debouncedQuery, bases, techniques, strengths, page, perPage, sort]);

  // APIを呼び出し、結果をstateとsessionStorageに反映
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const canUseSessionStorage =
      typeof window !== 'undefined' && !!window.sessionStorage;

    const applyResponse = (response: {
      cocktails: Cocktail[];
      meta: { total_pages: number; total_count: number };
    }) => {
      if (!mounted) return;
      setCocktails(response.cocktails);
      setTotalPages(response.meta.total_pages);
      setTotalCount(response.meta.total_count);
      setError(null);
    };

    if (canUseSessionStorage) {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          applyResponse(data);
          setIsLoading(false);
          return () => {
            mounted = false;
          };
        } catch {
          window.sessionStorage.removeItem(cacheKey);
        }
      }
    }

    const params: CocktailQuery = {
      page,
      per_page: perPage,
    };

    if (debouncedQuery) params.q = debouncedQuery;
    if (bases.length) params.base = bases;
    if (techniques.length) params.technique = techniques;
    if (strengths.length) params.strength = strengths;
    if (sort === 'popular') params.sort = 'popular';

    fetchCocktails(params)
      .then((response) => {
        if (mounted) {
          applyResponse(response);
          if (canUseSessionStorage) {
            window.sessionStorage.setItem(cacheKey, JSON.stringify(response));
          }
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setError(
          err instanceof Error ? err.message : 'Failed to fetch cocktails',
        );
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [
    bases,
    techniques,
    strengths,
    cacheKey,
    debouncedQuery,
    page,
    perPage,
    sort,
  ]);

  return {
    cocktails,
    totalPages,
    totalCount,
    error,
    isLoading,
    debouncedQuery,
    // モーダル内編集などで個別更新があった場合にリストへ反映する
    updateLocalCocktail: (updatedCocktail: Cocktail) => {
      setCocktails((prev) => {
        if (!prev) return prev;
        return prev.map((cocktail) =>
          cocktail.id === updatedCocktail.id ? updatedCocktail : cocktail,
        );
      });
    },
  };
}
