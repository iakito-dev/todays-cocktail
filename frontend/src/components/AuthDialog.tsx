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
      // エラーオブジェクトからメッセージを取得
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('ログインに失敗しました');
      }
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
      // 成功メッセージを表示
      setError('');
      alert('確認メールを送信しました。メールを確認してアカウントを有効化してください。');
      // Reset form
      setEmail('');
      setPassword('');
      setName('');
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Signup failed:', error);
      // エラーオブジェクトからメッセージを取得
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('アカウント作成に失敗しました');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent placement="raised" size="auth" className="gap-6 sm:gap-7 rounded-xl sm:rounded-2xl">
        <div className="flex flex-col gap-4 sm:gap-5">
          <DialogHeader className="space-y-2 text-center">
            <div className="flex items-center justify-center mb-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[20px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl shadow-md text-white">
                🍸
              </div>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900">Today's Cocktail</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-gray-500">
              お気に入りのカクテルを保存して、いつでも楽しめます
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="mt-1">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-11 sm:h-12 rounded-xl">
            <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-sm sm:text-base py-2 rounded-xl">
              ログイン
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-lg text-sm sm:text-base py-2 rounded-xl">
              新規登録
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 sm:space-y-5 mt-3">
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm sm:text-base">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-sm sm:text-base font-medium text-gray-700">メールアドレス</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-sm sm:text-base font-medium text-gray-700">パスワード</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md mt-1 text-base"
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 sm:space-y-5 mt-3">
            <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm sm:text-base">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="signup-name" className="text-sm sm:text-base font-medium text-gray-700">ユーザー名</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="例: カクテル太郎"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-email" className="text-sm sm:text-base font-medium text-gray-700">メールアドレス</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="signup-password" className="text-sm sm:text-base font-medium text-gray-700">パスワード</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md mt-1 text-base"
                disabled={isLoading}
              >
                {isLoading ? '登録中...' : '新規登録'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
