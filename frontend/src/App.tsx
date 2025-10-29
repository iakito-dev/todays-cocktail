import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CocktailList } from './components/CocktailList';
import { CocktailDetail } from './components/CocktailDetail';
import { Header } from './components/Header';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<CocktailList />} />
          <Route path="/cocktails/:id" element={<CocktailDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
