import { useEffect, useState } from 'react';
import { fetchCocktails, fetchCocktail, type CocktailQuery } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Heart, LogIn, SlidersHorizontal } from 'lucide-react';
import { TodaysPick } from './TodaysPick';
import { CocktailCard } from './CocktailCard';
import { CocktailFilters } from './CocktailFilters';
import { CocktailDetailDialog } from './CocktailDetailDialog';
import { AuthDialog } from './AuthDialog';
import { Pagination } from './Pagination';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import type { Cocktail } from '../lib/types';

const ITEMS_PER_PAGE = 10;

export function CocktailList() {
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [cocktailsError, setCocktailsError] = useState<string | null>(null);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);

  // Auth & Favorites
  const { user, login, signup } = useAuth();
  const { favorites, fetchFavorites, addFavorite, removeFavorite, getFavoriteId, isFavorite, clearFavorites } = useFavorites();

  // Filters
  const [q, setQ] = useState('');
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');
  // simple debounce
  const debouncedQ = useDebounce(q, 300);
  const debouncedIngredients = useDebounce(ingredients, 300);

  useEffect(() => {
    const params: CocktailQuery = {};
    if (debouncedQ) params.q = debouncedQ;
    if (selectedBases.length) params.base = selectedBases;
    if (debouncedIngredients) params.ingredients = debouncedIngredients;
    fetchCocktails(params)
      .then(setCocktails)
      .catch((e) => setCocktailsError(e.message));
    // フィルター変更時はページを1にリセット
    setCurrentPage(1);
  }, [debouncedQ, selectedBases, debouncedIngredients]);

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
  const allCocktailsTotal = cocktails?.length || 0;
  const allCocktailsTotalPages = Math.ceil(allCocktailsTotal / ITEMS_PER_PAGE);
  const allCocktailsPaginated = cocktails?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) || [];

  const favoritesTotal = favoriteCocktails.length;
  const favoritesTotalPages = Math.ceil(favoritesTotal / ITEMS_PER_PAGE);
  const favoritesPaginated = favoriteCocktails.slice(
    (favoritesPage - 1) * ITEMS_PER_PAGE,
    favoritesPage * ITEMS_PER_PAGE
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

  return (
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
                  ingredientSearch={ingredients}
                  onIngredientSearchChange={setIngredients}
                />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full bg-white border-gray-200 hover:bg-gray-50 h-12 rounded-xl"
                  >
                    <SlidersHorizontal className="w-5 h-5 mr-2" />
                    カクテル図鑑
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[380px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="text-lg font-semibold">カクテル図鑑</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <CocktailFilters
                      searchQuery={q}
                      onSearchChange={setQ}
                      selectedBases={selectedBases}
                      onBasesChange={setSelectedBases}
                      ingredientSearch={ingredients}
                      onIngredientSearchChange={setIngredients}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Today's Pick Section */}
            <TodaysPick onViewDetails={handleCocktailClick} />

            {/* Cocktails Section */}
            <section className="space-y-4">
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    すべて ({cocktails?.length || 0})
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
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                  )}
                  {cocktails && (
                    <>
                      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                        totalPages={allCocktailsTotalPages}
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
                          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
      />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={login}
        onSignup={signup}
      />
    </div>
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
