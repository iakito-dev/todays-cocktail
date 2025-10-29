import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-sm">
              🍸
            </div>
            <div className="leading-tight">
              <h1 className="text-2xl font-semibold text-gray-900">Today's Cocktail</h1>
              <p className="text-sm text-gray-500 mt-0.5">お気に入りの一杯を見つけよう</p>
            </div>
          </Link>

          {/* Login Button */}
          <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm px-5 py-2">
            <LogIn className="w-4 h-4 mr-2" />
            ログイン
          </Button>
        </div>
      </div>
    </header>
  );
}
