import { useState, useMemo, useEffect } from 'react';
import { CocktailBase, Cocktail } from './types/cocktail';
import { cocktailsData } from './data/cocktails';
import { CocktailCard } from './components/CocktailCard';
import { CocktailFilters } from './components/CocktailFilters';
import { CocktailDetailDialog } from './components/CocktailDetailDialog';
import { TodaysPick } from './components/TodaysPick';
import { AuthDialog } from './components/AuthDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Heart, LogIn, LogOut, Sparkles, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Toaster, toast } from 'sonner';
import * as api from './utils/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBase, setSelectedBase] = useState<CocktailBase | null>(null);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [todaysCocktail, setTodaysCocktail] = useState<Cocktail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pick random cocktail for today's pick
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * cocktailsData.length);
    setTodaysCocktail(cocktailsData[randomIndex]);
  }, []);

  // Load user session and favorites from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedSession = localStorage.getItem('session');

    if (savedUser && savedSession) {
      const parsedUser = JSON.parse(savedUser);
      const parsedSession = JSON.parse(savedSession);
      setUser(parsedUser);
      setSession(parsedSession);

      // Load favorites from server
      loadFavorites(parsedSession.access_token);
    }
  }, []);

  // Load favorites from server
  const loadFavorites = async (token: string) => {
    try {
      const response = await api.getFavorites(token);
      setFavorites(response.favorites || []);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  // Filter cocktails
  const filteredCocktails = useMemo(() => {
    return cocktailsData.filter((cocktail) => {
      // Name search
      if (searchQuery && !cocktail.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Base filter
      if (selectedBase && cocktail.base !== selectedBase) {
        return false;
      }

      // Ingredient search
      if (ingredientSearch) {
        const hasIngredient = cocktail.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
        );
        if (!hasIngredient) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedBase, ingredientSearch]);

  // Favorite cocktails
  const favoriteCocktails = useMemo(() => {
    return filteredCocktails.filter((cocktail) => favorites.includes(cocktail.id));
  }, [filteredCocktails, favorites]);

  const toggleFavorite = async (cocktailId: string) => {
    if (!user || !session) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const response = await api.toggleFavorite(cocktailId, session.access_token);
      setFavorites(response.favorites);

      const isFavorite = response.favorites.includes(cocktailId);
      toast.success(isFavorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました');
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('お気に入りの更新に失敗しました');
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await api.login(email, password);

      setUser(response.user);
      setSession(response.session);

      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('session', JSON.stringify(response.session));

      // Load favorites
      await loadFavorites(response.session.access_token);

      toast.success('ログインしました');
      setIsAuthOpen(false);
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('ログインに失敗しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      await api.signup(email, password, name);
      toast.success('アカウントを作成しました。ログインしてください。');

      // Auto login after signup
      await handleLogin(email, password);
    } catch (error) {
      console.error('Signup failed:', error);
      toast.error('アカウント作成に失敗しました');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSession(null);
    setFavorites([]);

    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('session');

    toast.success('ログアウトしました');
  };

  const displayedCocktails = activeTab === 'favorites' ? favoriteCocktails : filteredCocktails;

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl shadow-sm">
                🍸
              </div>
              <div>
                <h1 className="text-gray-900">
                  Today's Cocktails
                </h1>
                <p className="text-gray-500">今日の一杯がここに</p>
              </div>
            </div>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-700 hidden sm:inline">{user.name || user.email.split('@')[0]}</span>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">ログアウト</span>
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  ログイン
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 rounded-3xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="text-gray-900">カクテル図鑑</h2>
              </div>
              <CocktailFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedBase={selectedBase}
                onBaseChange={setSelectedBase}
                ingredientSearch={ingredientSearch}
                onIngredientSearchChange={setIngredientSearch}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Today's Pick - Only show when no filters applied */}
            {!searchQuery && !selectedBase && !ingredientSearch && todaysCocktail && (
              <TodaysPick
                cocktail={todaysCocktail}
                onViewDetails={setSelectedCocktail}
              />
            )}

            {/* Tabs */}
            <div className="bg-white rounded-3xl p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100">
                  <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    すべて ({filteredCocktails.length})
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    <Heart className="w-4 h-4" />
                    お気に入り ({favorites.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  {filteredCocktails.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-gray-900 mb-2">カクテルが見つかりません</h3>
                      <p className="text-gray-500">検索条件を変更してみてください</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500">
                          {filteredCocktails.length}種類のカクテルが見つかりました
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCocktails.map((cocktail) => (
                          <CocktailCard
                            key={cocktail.id}
                            cocktail={cocktail}
                            onViewDetails={setSelectedCocktail}
                            isFavorite={favorites.includes(cocktail.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="favorites" className="space-y-6">
                  {!user ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <div className="text-6xl mb-4">🔒</div>
                      <h3 className="text-gray-900 mb-2">ログインが必要です</h3>
                      <p className="text-gray-500 mb-6">
                        お気に入り機能を使うにはログインしてください
                      </p>
                      <Button
                        onClick={() => setIsAuthOpen(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                      >
                        <LogIn className="w-4 h-4 mr-2" />
                        ログインする
                      </Button>
                    </div>
                  ) : favoriteCocktails.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-4">❤️</div>
                      <h3 className="text-gray-900 mb-2">お気に入りがありません</h3>
                      <p className="text-gray-500">
                        気になるカクテルを見つけて、ハートマークをクリックしてみましょう
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <p className="text-gray-500">
                          {favoriteCocktails.length}種類のカクテルをお気に入り登録中
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favoriteCocktails.map((cocktail) => (
                          <CocktailCard
                            key={cocktail.id}
                            cocktail={cocktail}
                            onViewDetails={setSelectedCocktail}
                            isFavorite={favorites.includes(cocktail.id)}
                            onToggleFavorite={toggleFavorite}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-3xl">🍸</div>
            <h3 className="text-gray-900">Today's Cocktails</h3>
          </div>
          <p className="text-gray-600 mb-2">
            家でもバーでも、"今日の一杯"が見つかるカクテル図鑑
          </p>
          <p className="text-gray-500">
            カクテル初心者から愛好家まで、あなたにぴったりのレシピを
          </p>
        </div>
      </footer>

      {/* Dialogs */}
      <AuthDialog
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}
      />

      <CocktailDetailDialog
        cocktail={selectedCocktail}
        isOpen={!!selectedCocktail}
        onClose={() => setSelectedCocktail(null)}
        isFavorite={selectedCocktail ? favorites.includes(selectedCocktail.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
