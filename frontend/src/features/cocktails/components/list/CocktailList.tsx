import { useEffect, useState } from 'react';
import { Heart, Search } from 'lucide-react';
import { Card, CardContent } from '../../../../components/ui/card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../../../../components/ui/tabs';
import { Button } from '../../../../components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../../../components/ui/sheet';
import { TodaysPick } from '../../../todays-pick/components/TodaysPick';
import { CocktailFilters } from '../CocktailFilters';
import { CocktailDetailDialog } from '../detail/CocktailDetailDialog';
import { AuthDialog } from '../../../auth/components/AuthDialog';
import { SortMenu } from './SortMenu';
import { CocktailGridSection } from './CocktailGridSection';
import { FavoritesPanel } from './FavoritesPanel';
import { Seo } from '../../../../components/layout/Seo';
import { useFavorites } from '../../../../hooks/useFavorites';
import { useAuth } from '../../../../hooks/useAuth';
import type { Cocktail } from '../../../../lib/types';
import { fetchCocktail } from '../../../../lib/api';
import { absoluteUrl, siteMetadata } from '../../../../lib/seo';
import { useCocktailSearch } from '../../hooks/useCocktailSearch';

// =======================================
// SEO定義
// =======================================
// 構造化データを定数に切り出し、JSX内をシンプルに保つ
const HOME_WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteMetadata.siteName,
  url: siteMetadata.siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteMetadata.siteUrl}/?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

// =======================================
// Responsive Helper
// =======================================
// 画面幅に応じてカード表示数を切り替えるヘルパーhook
const useItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 9,
  );

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 1024 ? 8 : 9);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return itemsPerPage;
};

// =======================================
// Component
// =======================================
// 検索・お気に入り・詳細モーダルを束ねるトップページのコンテナ
export function CocktailList() {
  const itemsPerPage = useItemsPerPage();
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [q, setQ] = useState('');
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [sort, setSort] = useState<'id' | 'popular'>('id');

  const { user, login, signup } = useAuth();
  const {
    favorites,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    getFavoriteId,
    isFavorite,
    clearFavorites,
  } = useFavorites();

  const {
    cocktails,
    totalPages,
    totalCount,
    error: cocktailsError,
    isLoading,
    debouncedQuery,
    updateLocalCocktail,
  } = useCocktailSearch({
    query: q,
    bases: selectedBases,
    page: currentPage,
    perPage: itemsPerPage,
    sort,
  });

  // 検索条件が変わるたびにページを先頭へ戻し、APIパラメータをリセットする
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, selectedBases, sort]);

  // ログイン状態に合わせてお気に入り一覧を同期する
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      clearFavorites();
    }
  }, [user, fetchFavorites, clearFavorites]);

  // カードクリック時に詳細データを取得し、モーダル用stateへ格納する
  const handleCocktailClick = async (cocktail: Cocktail) => {
    try {
      const detailedCocktail = await fetchCocktail(cocktail.id);
      setSelectedCocktail(detailedCocktail);
    } catch {
      setSelectedCocktail(cocktail);
    } finally {
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCocktail(null);
  };

  // ログイン必須のため未認証ならAuthダイアログを開き、それ以外はAPI呼び出し
  const handleFavoriteToggle = async (cocktailId: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    const favorited = isFavorite(cocktailId);
    if (favorited) {
      const favoriteId = getFavoriteId(cocktailId);
      if (favoriteId) {
        await removeFavorite(favoriteId);
      }
    } else {
      await addFavorite(cocktailId);
    }
  };

  // 一覧とお気に入りでページングを独立させる
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setCurrentPage(1);
    } else {
      setFavoritesPage(1);
    }
  };

  // SortMenuから受け取った値をstateに反映し、メニュー開閉はコンポーネント側に任せる
  const handleSortSelect = (value: 'id' | 'popular') => {
    setSort(value);
  };

  const favoriteCocktails = favorites.map((favorite) => favorite.cocktail);
  const favoritesTotal = favoriteCocktails.length;
  const favoritesTotalPages = Math.ceil(favoritesTotal / itemsPerPage) || 1;
  const favoritesPaginated = favoriteCocktails.slice(
    (favoritesPage - 1) * itemsPerPage,
    favoritesPage * itemsPerPage,
  );

  const itemListStructuredData =
    cocktails && cocktails.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: cocktails
            .slice(0, Math.min(10, cocktails.length))
            .map((cocktail, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              url: absoluteUrl(`/cocktails/${cocktail.id}`),
              name: cocktail.name_ja || cocktail.name,
            })),
        }
      : undefined;

  const homeStructuredData = itemListStructuredData
    ? [HOME_WEBSITE_JSON_LD, itemListStructuredData]
    : HOME_WEBSITE_JSON_LD;

  return (
    <>
      <Seo
        title="Today's Cocktail - 今日の一杯が見つかるカクテル図鑑"
        description="ベース酒や味わい、人気順で40種類以上のカクテルを検索。今日のおすすめやお気に入り機能で、自分だけの一杯を見つけましょう。"
        path="/"
        structuredData={homeStructuredData}
      />
      <div className="min-h-screen bg-gray-50 text-foreground">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            <aside className="hidden lg:block lg:sticky lg:top-6 lg:h-fit">
              <Card className="bg-white border-gray-200">
                <CardContent className="pt-6">
                  <CocktailFilters
                    searchQuery={q}
                    onSearchChange={setQ}
                    selectedBases={selectedBases}
                    onBasesChange={setSelectedBases}
                  />
                </CardContent>
              </Card>
            </aside>

            <main className="space-y-6">
              <div className="order-1">
                <TodaysPick onViewDetails={handleCocktailClick} />
              </div>

              <section className="space-y-4 order-2">
                <Tabs
                  value={activeTab}
                  onValueChange={handleTabChange}
                  className="w-full"
                >
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger
                      value="all"
                      className="flex items-center gap-2"
                    >
                      すべて ({totalCount || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="favorites"
                      className="flex items-center gap-2"
                    >
                      <Heart
                        size={16}
                        className={user ? 'fill-red-500 text-red-500' : ''}
                      />
                      お気に入り ({favorites.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4 mt-6">
                    <CocktailGridSection
                      cocktails={cocktails}
                      totalCount={totalCount}
                      isLoading={isLoading}
                      error={cocktailsError}
                      itemsPerPage={itemsPerPage}
                      sortMenu={
                        <SortMenu value={sort} onChange={handleSortSelect} />
                      }
                      onCardClick={handleCocktailClick}
                      onFavoriteToggle={handleFavoriteToggle}
                      isFavorite={isFavorite}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </TabsContent>

                  <TabsContent value="favorites" className="space-y-4 mt-6">
                    <FavoritesPanel
                      isAuthenticated={Boolean(user)}
                      favorites={favoriteCocktails}
                      paginatedFavorites={favoritesPaginated}
                      currentPage={favoritesPage}
                      totalPages={favoritesTotalPages}
                      onPageChange={setFavoritesPage}
                      onRequireLogin={() => setIsAuthOpen(true)}
                      onCardClick={handleCocktailClick}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  </TabsContent>
                </Tabs>
              </section>
            </main>
          </div>
        </div>

        <CocktailDetailDialog
          cocktail={selectedCocktail}
          isOpen={isDialogOpen}
          onClose={handleCloseDialog}
          isFavorite={
            selectedCocktail ? isFavorite(selectedCocktail.id) : false
          }
          onToggleFavorite={handleFavoriteToggle}
          onUpdate={(updatedCocktail) => {
            updateLocalCocktail(updatedCocktail);
            setSelectedCocktail(updatedCocktail);
          }}
        />

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button className="lg:hidden fixed bottom-32 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all z-50 p-0">
              <Search className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[320px] sm:w-[380px] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="text-lg font-semibold">
                検索・絞り込み
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <CocktailFilters
                searchQuery={q}
                onSearchChange={setQ}
                selectedBases={selectedBases}
                onBasesChange={setSelectedBases}
              />
            </div>
          </SheetContent>
        </Sheet>

        <AuthDialog
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={login}
          onSignup={signup}
        />
      </div>
    </>
  );
}
