import { useEffect, useRef, useState } from 'react';
import { fetchCocktails, fetchCocktail, type CocktailQuery } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Heart, LogIn, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { TodaysPick } from './TodaysPick';
import { CocktailCard } from './CocktailCard';
import { CocktailFilters } from './CocktailFilters';
import { CocktailDetailDialog } from './cocktail/CocktailDetailDialog';
import { AuthDialog } from './AuthDialog';
import { Pagination } from './Pagination';
import { Seo } from './Seo';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import type { Cocktail } from '../lib/types';
import { absoluteUrl, siteMetadata } from '../lib/seo';

// 画面サイズに応じた表示件数を取得
const useItemsPerPage = () => {
  const [itemsPerPage, setItemsPerPage] = useState(
    typeof window !== 'undefined' && window.innerWidth < 1024 ? 8 : 9
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

export function CocktailList() {
  const itemsPerPage = useItemsPerPage();
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [cocktailsError, setCocktailsError] = useState<string | null>(null);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);

  // Auth & Favorites
  const { user, login, signup } = useAuth();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, getFavoriteId, isFavorite, clearFavorites } = useFavorites();

  // Filters
  const [q, setQ] = useState('');
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [sort, setSort] = useState<'id' | 'popular'>('id');
  const sortMenuRef = useRef<HTMLDivElement>(null);
  // simple debounce
  const debouncedQ = useDebounce(q, 300);

  useEffect(() => {
    // セッションストレージのキャッシュキーを生成
    const cacheKey = `cocktails_${JSON.stringify({
      q: debouncedQ,
      base: selectedBases,
      page: currentPage,
      per_page: itemsPerPage,
      sort
    })}`;

    // キャッシュをチェック
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setCocktails(data.cocktails);
        setTotalPages(data.meta.total_pages);
        setTotalCount(data.meta.total_count);
        return;
      } catch {
        // キャッシュ読み込み失敗時は再取得
      }
    }

    const params: CocktailQuery = {
      page: currentPage,
      per_page: itemsPerPage
    };
    if (debouncedQ) params.q = debouncedQ;
    if (selectedBases.length) params.base = selectedBases;
    if (sort === 'popular') params.sort = 'popular';

    fetchCocktails(params)
      .then((response) => {
        setCocktails(response.cocktails);
        setTotalPages(response.meta.total_pages);
        setTotalCount(response.meta.total_count);
        // キャッシュに保存（セッション中のみ有効）
        sessionStorage.setItem(cacheKey, JSON.stringify(response));
      })
      .catch((e) => setCocktailsError(e.message));
  }, [debouncedQ, selectedBases, currentPage, itemsPerPage, sort]);

  // フィルター変更時はページを1にリセット
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQ, selectedBases, sort]);

  useEffect(() => {
    if (!isSortMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSortMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSortMenuOpen]);

  // お気に入り一覧を取得 or クリア
  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      // ログアウト時にお気に入りをクリア
      clearFavorites();
    }
  }, [user, fetchFavorites, clearFavorites]);

  const handleCocktailClick = async (cocktail: Cocktail) => {
    try {
      // 詳細データを取得(ingredients付き)
      const detailedCocktail = await fetchCocktail(cocktail.id);
      setSelectedCocktail(detailedCocktail);
      setIsDialogOpen(true);
    } catch {
      // エラーでも基本情報で開く
      setSelectedCocktail(cocktail);
      setIsDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCocktail(null);
  };

  const handleFavoriteToggle = async (cocktailId: number) => {
    if (!user) {
      // ログインダイアログを開く
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

  // お気に入りカクテル一覧を取得
  const favoriteCocktails = favorites.map(fav => fav.cocktail);

  // ページネーション用の計算
  // バックエンドからページネーションされたデータを受け取るため、スライスは不要
  const allCocktailsPaginated = cocktails || [];

  const favoritesTotal = favoriteCocktails.length;
  const favoritesTotalPages = Math.ceil(favoritesTotal / itemsPerPage);
  const favoritesPaginated = favoriteCocktails.slice(
    (favoritesPage - 1) * itemsPerPage,
    favoritesPage * itemsPerPage
  );

  // タブ切り替え時にページをリセット
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setCurrentPage(1);
    } else {
      setFavoritesPage(1);
    }
  };

  const handleSortSelect = (value: 'id' | 'popular') => {
    setSort(value);
    setIsSortMenuOpen(false);
  };

  const itemListStructuredData = cocktails && cocktails.length
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
        title="Today's Cocktail｜今日の一杯が見つかるカクテル図鑑"
        description="ベース酒や味わい、人気順で40種類以上のカクテルを検索。今日のおすすめやお気に入り機能で、自分だけの一杯を見つけましょう。"
        path="/"
        structuredData={homeStructuredData}
      />
      <div className="min-h-screen bg-gray-50 text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar - Filters (Desktop Only) */}
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

          {/* Main Content */}
          <main className="space-y-6">
            {/* Today's Pick Section */}
            <div className="order-1">
              <TodaysPick onViewDetails={handleCocktailClick} />
            </div>

            {/* Cocktails Section */}
            <section className="space-y-4 order-2">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    すべて ({totalCount || 0})
                  </TabsTrigger>
                  <TabsTrigger
                    value="favorites"
                    className="flex items-center gap-2"
                  >
                    <Heart size={16} className={user ? 'fill-red-500 text-red-500' : ''} />
                    お気に入り ({favorites.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {cocktailsError && (
                    <p className="text-sm text-red-500">Failed to load: {cocktailsError}</p>
                  )}
                  {!cocktails && !cocktailsError && (
                    <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: itemsPerPage }).map((_, i) => (
                        <Card key={i} className="overflow-hidden border bg-white border-gray-200 rounded-xl">
                          <div className="relative aspect-[4/3]">
                            <Skeleton className="absolute inset-0" />
                          </div>
                          <CardContent className="p-3 md:p-5">
                            <div className="mb-2 md:mb-3">
                              <Skeleton className="h-6 w-3/4 mb-2" />
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
                  {cocktails && (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-gray-600">
                          {totalCount}種類のカクテルが見つかりました
                        </span>
                        <div className="relative" ref={sortMenuRef}>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-9 rounded-xl bg-white border-gray-200 hover:bg-gray-50"
                            onClick={() => setIsSortMenuOpen((prev) => !prev)}
                            aria-haspopup="menu"
                            aria-expanded={isSortMenuOpen}
                          >
                            並べ替え
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          {isSortMenuOpen && (
                            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-gray-200 bg-white shadow-lg z-50">
                              <div className="py-2">
                                <button
                                  type="button"
                                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                                    sort === 'id' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleSortSelect('id')}
                                >
                                  <span>デフォルト</span>
                                  {sort === 'id' && <Check className="h-4 w-4" />}
                                </button>
                                <button
                                  type="button"
                                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition ${
                                    sort === 'popular'
                                      ? 'bg-gray-100 text-gray-900'
                                      : 'text-gray-600 hover:bg-gray-50'
                                  }`}
                                  onClick={() => handleSortSelect('popular')}
                                >
                                  <span>人気順</span>
                                  {sort === 'popular' && <Check className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
                        {allCocktailsPaginated.map((c) => (
                          <CocktailCard
                            key={c.id}
                            cocktail={c}
                            onViewDetails={handleCocktailClick}
                            onFavoriteToggle={handleFavoriteToggle}
                            isFavorited={isFavorite(c.id)}
                            showFavoriteButton={true}
                          />
                        ))}
                      </div>
                      {cocktails.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <p>条件に一致するカクテルが見つかりませんでした</p>
                        </div>
                      )}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </>
                  )}
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4 mt-6">
                  {user ? (
                    <>
                      {favorites.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Heart size={48} className="mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">お気に入りがありません</p>
                          <p className="text-sm mt-2">カクテルのハートマークをクリックして、お気に入りに追加しましょう</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-3">
                            {favoritesPaginated.map((c) => (
                              <CocktailCard
                                key={c.id}
                                cocktail={c}
                                onViewDetails={handleCocktailClick}
                                onFavoriteToggle={handleFavoriteToggle}
                                isFavorited={true}
                                showFavoriteButton={true}
                              />
                            ))}
                          </div>
                          <Pagination
                            currentPage={favoritesPage}
                            totalPages={favoritesTotalPages}
                            onPageChange={setFavoritesPage}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">ログインが必要です</h3>
                      <p className="text-gray-500 mb-6">
                        お気に入り機能を使うにはログインしてください
                      </p>
                      <Button
                        onClick={() => setIsAuthOpen(true)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        ログインする
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </section>
          </main>
        </div>
      </div>

      {/* Cocktail Detail Dialog */}
      <CocktailDetailDialog
        cocktail={selectedCocktail}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        isFavorite={selectedCocktail ? isFavorite(selectedCocktail.id) : false}
        onToggleFavorite={handleFavoriteToggle}
        onUpdate={(updatedCocktail) => {
          // カクテルリストを更新
          setCocktails((prev) =>
            prev ? prev.map((c) => (c.id === updatedCocktail.id ? updatedCocktail : c)) : prev
          );
          setSelectedCocktail(updatedCocktail);
        }}
      />

      {/* Floating Action Button - Mobile Only */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetTrigger asChild>
          <Button
            className="lg:hidden fixed bottom-32 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all z-50 p-0"
          >
            <SlidersHorizontal className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-semibold">検索・絞り込み</SheetTitle>
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

      {/* Auth Dialog */}
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

// simple debounce hook
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
