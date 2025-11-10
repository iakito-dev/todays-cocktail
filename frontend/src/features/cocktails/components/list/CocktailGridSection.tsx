import type { ReactNode } from 'react';
import type { Cocktail } from '../../../../lib/types';
import { Card, CardContent } from '../../../../components/ui/card';
import { Skeleton } from '../../../../components/ui/skeleton';
import { CocktailCard } from '../CocktailCard';
import { Pagination } from '../Pagination';

// =======================================
// Props
// =======================================
// 一覧表示で受け取るデータとハンドラーを型で縛り、親コンテナとの契約を明示
interface CocktailGridSectionProps {
  cocktails: Cocktail[] | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  itemsPerPage: number;
  sortMenu: ReactNode;
  onCardClick: (cocktail: Cocktail) => void;
  onFavoriteToggle: (cocktailId: number) => void | Promise<void>;
  isFavorite: (cocktailId: number) => boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// =======================================
// Component
// =======================================
// 読み込み・空状態・通常グリッドの3ステートを担うレイアウトコンポーネント
export function CocktailGridSection({
  cocktails,
  totalCount,
  isLoading,
  error,
  itemsPerPage,
  sortMenu,
  onCardClick,
  onFavoriteToggle,
  isFavorite,
  currentPage,
  totalPages,
  onPageChange,
}: CocktailGridSectionProps) {
  const showGrid = Array.isArray(cocktails);
  const showEmptyState = showGrid && cocktails.length === 0 && !isLoading;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-gray-600">
          {totalCount}種類のカクテルが見つかりました
        </span>
        {sortMenu}
      </div>

      {/* エラー表示：API失敗時のみメッセージを出す */}
      {error && !isLoading && (
        <p className="text-sm text-red-500">Failed to load: {error}</p>
      )}

      {/* ローディング表示：Skeletonでカードのレイアウトを占位 */}
      {isLoading && !showGrid && (
        <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <Card
              key={`cocktail-skeleton-${index}`}
              className="overflow-hidden border bg-white border-gray-200 rounded-2xl"
            >
              <div className="relative aspect-[4/3]">
                <Skeleton className="absolute inset-0" />
              </div>
              <CardContent className="p-3 md:p-5">
                <div className="mb-2 md:mb-3 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* グリッド表示：データが存在する場合にカード＋ページネーションを描画 */}
      {showGrid && (
        <div className="space-y-4">
          <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
            {cocktails.map((cocktail) => (
              <CocktailCard
                key={cocktail.id}
                cocktail={cocktail}
                onViewDetails={onCardClick}
                onFavoriteToggle={onFavoriteToggle}
                isFavorited={isFavorite(cocktail.id)}
                showFavoriteButton
              />
            ))}
          </div>

          {showEmptyState && (
            <div className="text-center py-12 text-gray-500">
              <p>条件に一致するカクテルが見つかりませんでした</p>
            </div>
          )}

          {!showEmptyState && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}
