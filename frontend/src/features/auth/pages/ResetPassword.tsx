import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from '@vuer-ai/react-helmet-async';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { resetPasswordWithToken } from '../../../lib/api';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialToken = useMemo(
    () => searchParams.get('token') ?? '',
    [searchParams],
  );

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setToken(initialToken);
  }, [initialToken]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!token) {
      setStatus({
        type: 'error',
        message: 'メールのリンクからアクセスし直してください。',
      });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: 'error', message: '新しいパスワードが一致しません。' });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPasswordWithToken(token, password, confirmPassword);
      setStatus({
        type: 'success',
        message: 'パスワードを再設定しました。ログインし直してください。',
      });
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'パスワードの再設定に失敗しました。',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <Helmet>
        <title>パスワード再設定 | Today&apos;s Cocktail</title>
      </Helmet>
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="space-y-4 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl text-white shadow-lg">
            ✨
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            パスワード再設定
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            メールで受け取ったリンクからアクセスし、新しいパスワードを設定してください。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="reset-token">再設定トークン</Label>
              <Input
                id="reset-token"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="メール内のURLから自動入力されます"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">新しいパスワード</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
                className="h-11"
              />
            </div>

            {status && (
              <p
                className={`text-sm rounded-2xl px-3 py-2 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {status.message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {isSubmitting ? '更新中...' : 'パスワードを更新'}
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full text-gray-600 hover:text-gray-900"
            >
              <Link to="/">トップページへ戻る</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
