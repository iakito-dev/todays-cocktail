import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CocktailList } from './components/CocktailList';
import { CocktailDetail } from './components/CocktailDetail';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { EmailConfirmation } from './components/EmailConfirmation';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

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
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
