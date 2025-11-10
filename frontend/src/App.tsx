import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/next';
import { CocktailList } from './features/cocktails/components/list/CocktailList';
import { CocktailDetail } from './features/cocktails/pages/CocktailDetail';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { EmailConfirmation } from './features/auth/pages/EmailConfirmation';
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
          <Routes>
            <Route path="/" element={<CocktailList />} />
            <Route path="/cocktails/:id" element={<CocktailDetail />} />
            <Route path="/confirmation" element={<EmailConfirmation />} />
          </Routes>
          <Footer />
          <Toaster />
          <Analytics />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
