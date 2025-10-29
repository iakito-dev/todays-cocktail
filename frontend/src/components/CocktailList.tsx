import { useEffect, useState } from 'react';
import { fetchCocktails, fetchCocktail, type CocktailQuery } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { TodaysPick } from './TodaysPick';
import { CocktailCard } from './CocktailCard';
import { CocktailFilters } from './CocktailFilters';
import { CocktailDetailDialog } from './CocktailDetailDialog';
import type { Cocktail } from '../lib/types';

export function CocktailList() {
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [cocktailsError, setCocktailsError] = useState<string | null>(null);
  const [selectedCocktail, setSelectedCocktail] = useState<Cocktail | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
  }, [debouncedQ, selectedBases, debouncedIngredients]);

  const handleCocktailClick = async (cocktail: Cocktail) => {
    try {
      // 詳細データを取得（ingredients付き）
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

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Sidebar - Filters */}
          <aside className="lg:sticky lg:top-6 lg:h-fit">
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

            {/* Today's Pick Section */}
            <TodaysPick onViewDetails={handleCocktailClick} />

            {/* Cocktails Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900">カクテル一覧</h2>

              {cocktailsError && (
                <p className="text-sm text-red-500">Failed to load: {cocktailsError}</p>
              )}
              {!cocktails && !cocktailsError && (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              )}
              {cocktails && (
                <>
                  <p className="text-sm text-gray-600">{cocktails.length}件のカクテルが見つかりました</p>
                  <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {cocktails.map((c) => (
                      <CocktailCard
                        key={c.id}
                        cocktail={c}
                        onViewDetails={handleCocktailClick}
                      />
                    ))}
                  </div>
                  {cocktails.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>条件に一致するカクテルが見つかりませんでした</p>
                    </div>
                  )}
                </>
              )}
            </section>
          </main>
        </div>
      </div>

      {/* Cocktail Detail Dialog */}
      <CocktailDetailDialog
        cocktail={selectedCocktail}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
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
