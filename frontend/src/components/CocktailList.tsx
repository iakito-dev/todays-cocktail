import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHealth, fetchCocktails, type CocktailQuery } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { TodaysPick } from './TodaysPick';
import type { Cocktail } from '../lib/types';

export function CocktailList() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>('checking...');
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [cocktailsError, setCocktailsError] = useState<string | null>(null);
  // Filters
  const [q, setQ] = useState('');
  const [selectedBases, setSelectedBases] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState('');

  // simple debounce
  const debouncedQ = useDebounce(q, 300);
  const debouncedIngredients = useDebounce(ingredients, 300);

  useEffect(() => {
    fetchHealth()
      .then((t) => setStatus(t))
      .catch((e) => setStatus(`error: ${e.message}`));
  }, []);

  useEffect(() => {
    const params: CocktailQuery = {};
    if (debouncedQ) params.q = debouncedQ;
    if (selectedBases.length) params.base = selectedBases;
    if (debouncedIngredients) params.ingredients = debouncedIngredients;
    fetchCocktails(params)
      .then(setCocktails)
      .catch((e) => setCocktailsError(e.message));
  }, [debouncedQ, selectedBases, debouncedIngredients]);

  const handleCocktailClick = (cocktailId: number) => {
    navigate(`/cocktails/${cocktailId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Today's Cocktail</h1>
        
        {/* Today's Pick Section */}
        <TodaysPick />

        <Card>
          <CardHeader>Backend /health</CardHeader>
          <CardContent>
            <p>status: {status}</p>
            <div className="mt-3">
              <Button onClick={() => window.location.reload()}>Reload</Button>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Cocktails</h2>
          {/* Filters */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">カクテル名で検索</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  placeholder="マティーニ、モヒート…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ベースで選ぶ</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {BASE_OPTIONS.map((b) => {
                    const active = selectedBases.includes(b.value);
                    return (
                      <button
                        key={b.value}
                        className={`text-sm border rounded-md px-2 py-1 ${active ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
                        onClick={() =>
                          setSelectedBases((prev) =>
                            prev.includes(b.value) ? prev.filter((x) => x !== b.value) : [...prev, b.value]
                          )
                        }
                      >
                        {b.label}
                      </button>
                    );
                  })}
                  {selectedBases.length > 0 && (
                    <button
                      className="text-xs underline col-span-full justify-self-start text-muted-foreground"
                      onClick={() => setSelectedBases([])}
                    >
                      クリア
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">手持ちの材料から探す</label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                  placeholder="ライム、ジン… (カンマで区切り)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          {cocktailsError && (
            <p className="text-sm text-red-500">Failed to load: {cocktailsError}</p>
          )}
          {!cocktails && !cocktailsError && <p>Loading...</p>}
          {cocktails && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cocktails.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleCocktailClick(c.id)}
                >
                  <CardHeader className="space-y-1">
                    <div className="font-bold">{c.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Base: {c.base} · Strength: {c.strength} · Technique: {c.technique}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {c.image_url && (
                      <img
                        src={c.image_url}
                        alt={c.name}
                        className="w-full h-40 object-cover rounded"
                        loading="lazy"
                      />
                    )}
                    {c.instructions && (
                      <p className="mt-3 text-sm whitespace-pre-wrap">{c.instructions}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// UI constants
const BASE_OPTIONS = [
  { value: 'gin', label: 'ジン' },
  { value: 'rum', label: 'ラム' },
  { value: 'whisky', label: 'ウイスキー' },
  { value: 'vodka', label: 'ウォッカ' },
  { value: 'tequila', label: 'テキーラ' },
  { value: 'beer', label: 'ビール' },
  { value: 'wine', label: 'ワイン' },
] as const;

// simple debounce hook
function useDebounce<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
