import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CocktailList } from './components/CocktailList';
import { CocktailDetail } from './components/CocktailDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CocktailList />} />
        <Route path="/cocktails/:id" element={<CocktailDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
