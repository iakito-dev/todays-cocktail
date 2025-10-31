import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name: string) => Promise<void>;
  isLoading?: boolean;
}

export function AuthDialog({ isOpen, onClose, onLogin, onSignup, isLoading }: AuthDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }

    try {
      await onLogin(email, password);
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Login failed:', error);
      setError('ログインに失敗しました');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !name) {
      setError('すべての項目を入力してください');
      return;
    }

    try {
      await onSignup(email, password, name);
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Signup failed:', error);
      setError('アカウント作成に失敗しました');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl shadow-sm">
              🍸
            </div>
          </div>
          <DialogTitle className="text-center text-2xl text-gray-900">Today's Cocktail</DialogTitle>
          <DialogDescription className="text-center text-base">
            お気に入りのカクテルを保存して、いつでも楽しめます
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-11">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">ログイン</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">新規登録</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">メールアドレス</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">パスワード</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-sm font-medium text-gray-700">お名前</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="田中太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-sm font-medium text-gray-700">メールアドレス</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium text-gray-700">パスワード</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? '登録中...' : '新規登録'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
