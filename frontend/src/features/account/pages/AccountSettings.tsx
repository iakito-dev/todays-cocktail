import { useEffect, useMemo, useState } from 'react';
import { Helmet } from '@vuer-ai/react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';

interface StatusMessage {
  type: 'success' | 'error';
  message: string;
}

export function AccountSettings() {
  const { user, isAuthenticated, updateProfile, changePassword } = useAuth();
  const initialName = useMemo(() => user?.name ?? '', [user?.name]);
  const [displayName, setDisplayName] = useState(initialName);
  const [profileStatus, setProfileStatus] = useState<StatusMessage | null>(
    null,
  );
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<StatusMessage | null>(
    null,
  );
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  useEffect(() => {
    setDisplayName(initialName);
  }, [initialName]);

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setProfileStatus(null);
    setIsProfileSaving(true);

    try {
      await updateProfile(displayName);
      setProfileStatus({
        type: 'success',
        message: 'ユーザー名を更新しました。',
      });
    } catch (error) {
      setProfileStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'ユーザー名の更新に失敗しました。',
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: '新しいパスワードが一致しません。',
      });
      return;
    }

    setIsPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordStatus({
        type: 'success',
        message: 'パスワードを更新しました。',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordStatus({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'パスワードの更新に失敗しました。',
      });
    } finally {
      setIsPasswordSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <Helmet>
          <title>アカウント設定 | Today&apos;s Cocktail</title>
        </Helmet>
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>アカウント設定</CardTitle>
            <CardDescription>
              ログインするとユーザー情報を編集できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              アカウント設定を利用するにはログインしてください。ヘッダーの「ログイン」ボタンからサインインできます。
            </p>
            <Button asChild variant="secondary">
              <Link to="/">トップページへ戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <Helmet>
        <title>アカウント設定 | Today&apos;s Cocktail</title>
        <meta
          name="description"
          content="ユーザー名やパスワードを更新できるアカウント設定ページです。"
        />
      </Helmet>

      <section>
        <h2 className="text-2xl font-semibold text-gray-900">アカウント設定</h2>
        <p className="text-sm text-gray-500 mt-1">
          ログイン中のユーザー情報を編集できます。
        </p>
      </section>

      <section className="flex flex-col gap-8">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>ユーザー名</CardTitle>
            <CardDescription>
              アプリ内で表示される名前を変更します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label htmlFor="display-name">ユーザー名</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="カクテル好きさん"
                  disabled={isProfileSaving}
                />
              </div>

              {profileStatus && (
                <p
                  className={`text-sm rounded-lg px-3 py-2 ${
                    profileStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {profileStatus.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isProfileSaving || !displayName.trim()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow"
              >
                {isProfileSaving ? '保存中...' : '保存する'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>パスワード</CardTitle>
            <CardDescription>
              定期的な更新でアカウントを安全に保ちましょう。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={isPasswordSaving}
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={isPasswordSaving}
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  新しいパスワード（確認）
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  disabled={isPasswordSaving}
                  autoComplete="new-password"
                />
              </div>

              {passwordStatus && (
                <p
                  className={`text-sm rounded-lg px-3 py-2 ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {passwordStatus.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isPasswordSaving}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow"
              >
                {isPasswordSaving ? '更新中...' : 'パスワードを変更'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <div className="flex justify-start">
        <Button
          asChild
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
        >
          <Link to="/">← トップに戻る</Link>
        </Button>
      </div>
    </main>
  );
}
