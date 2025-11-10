import { Heart, LogIn } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import type { Cocktail } from '../../../../lib/types';
import { CocktailCard } from '../CocktailCard';
import { Pagination } from '../Pagination';

// =======================================
// Props
// =======================================
// 認証状態やお気に入りデータ、イベントハンドラーを型で明確化する
interface FavoritesPanelProps {
  isAuthenticated: boolean;
  favorites: Cocktail[];
  paginatedFavorites: Cocktail[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRequireLogin: () => void;
  onCardClick: (cocktail: Cocktail) => void;
  onFavoriteToggle: (cocktailId: number) => void | Promise<void>;
}

// =======================================
// Component
// =======================================
// お気に入りタブのコンテンツ。ログイン状態と件数でUIを切り替える
export function FavoritesPanel({
  isAuthenticated,
  favorites,
  paginatedFavorites,
  currentPage,
  totalPages,
  onPageChange,
  onRequireLogin,
  onCardClick,
  onFavoriteToggle,
}: FavoritesPanelProps) {
  // 未ログイン時は説明とログインボタンのみ表示
  if (!isAuthenticated) {
    return (
      <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ログインが必要です
        </h3>
        <p className="text-gray-500 mb-6">
          お気に入り機能を使うにはログインしてください
        </p>
        <Button
          onClick={onRequireLogin}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm"
        >
          <LogIn className="w-4 h-4 mr-2" />
          ログインする
        </Button>
      </div>
    );
  }

  // お気に入りが空ならハートアイコンの案内を表示
  if (favorites.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Heart size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium">お気に入りがありません</p>
        <p className="text-sm mt-2">
          カクテルのハートマークをクリックして、お気に入りに追加しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
        {paginatedFavorites.map((cocktail) => (
          <CocktailCard
            key={cocktail.id}
            cocktail={cocktail}
            onViewDetails={onCardClick}
            onFavoriteToggle={onFavoriteToggle}
            isFavorited
            showFavoriteButton
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
