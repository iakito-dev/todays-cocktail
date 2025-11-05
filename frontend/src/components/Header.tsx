import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from './ui/button';
import { LogIn, LogOut } from 'lucide-react';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user, isAuthenticated, login, signup, logout, isLoading } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    setIsAuthDialogOpen(false);
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    await signup(email, password, name);
    setIsAuthDialogOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
                🍸
              </div>
              <div className="leading-tight">
                <h1 className="text-lg sm:text-2xl font-semibold text-gray-900">Today's Cocktail</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">"今日の一杯"が見つかるカクテル検索アプリ</p>
              </div>
            </Link>

            {/* Login/Logout Button */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium text-gray-900">{user?.name}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">ログアウト</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm px-3 sm:px-5 py-2"
              >
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">ログイン</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
        onLogin={handleLogin}
        onSignup={handleSignup}
        isLoading={isLoading}
      />
    </>
  );
}
