import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/next';
import { lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
// Route-level code splitting
const CocktailList = lazy(() =>
  import('./features/cocktails/components/list/CocktailList').then((m) => ({
    default: m.CocktailList,
  })),
);
const CocktailDetail = lazy(() =>
  import('./features/cocktails/pages/CocktailDetail').then((m) => ({
    default: m.CocktailDetail,
  })),
);
const EmailConfirmation = lazy(() =>
  import('./features/auth/pages/EmailConfirmation').then((m) => ({
    default: m.EmailConfirmation,
  })),
);
const ResetPassword = lazy(() =>
  import('./features/auth/pages/ResetPassword').then((m) => ({
    default: m.ResetPassword,
  })),
);
const AccountSettings = lazy(() =>
  import('./features/account/pages/AccountSettings').then((m) => ({
    default: m.AccountSettings,
  })),
);
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// =======================================
// Component
// =======================================
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Suspense
            fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}
          >
            <Routes>
              <Route path="/" element={<CocktailList />} />
              <Route path="/cocktails/:id" element={<CocktailDetail />} />
              <Route path="/confirmation" element={<EmailConfirmation />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/settings" element={<AccountSettings />} />
            </Routes>
          </Suspense>
          <Footer />
          <Toaster />
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
