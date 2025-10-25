import { useEffect, useState } from 'react';
import { fetchHealth, fetchCocktails } from './lib/api';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardContent } from './components/ui/card';
import type { Cocktail } from './lib/types';

function App() {
  const [status, setStatus] = useState<string>('checking...');
  const [cocktails, setCocktails] = useState<Cocktail[] | null>(null);
  const [cocktailsError, setCocktailsError] = useState<string | null>(null);

  useEffect(() => {
    fetchHealth()
      .then((t) => setStatus(t))
      .catch((e) => setStatus(`error: ${e.message}`));
  }, []);

  useEffect(() => {
    fetchCocktails()
      .then(setCocktails)
      .catch((e) => setCocktailsError(e.message));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Frontend ↔ Backend Health Check</h1>
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
          {cocktailsError && (
            <p className="text-sm text-red-500">Failed to load: {cocktailsError}</p>
          )}
          {!cocktails && !cocktailsError && <p>Loading...</p>}
          {cocktails && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cocktails.map((c) => (
                <Card key={c.id}>
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

export default App;
