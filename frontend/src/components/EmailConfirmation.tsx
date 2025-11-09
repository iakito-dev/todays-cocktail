import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Seo } from './Seo';

export function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmationToken = searchParams.get('confirmation_token');

    if (!confirmationToken) {
      setStatus('error');
      setMessage('確認トークンが見つかりません。');
      return;
    }

    // メールアドレス確認APIを呼び出す
    const confirmEmail = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/confirmation?confirmation_token=${confirmationToken}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          // JWTトークンをAuthorizationヘッダーから取得
          const authHeader = response.headers.get('Authorization');
          if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            localStorage.setItem('auth_token', token);
          }

          setStatus('success');
          setMessage('メールアドレスの認証が完了しました。ホーム画面へリダイレクトします。');

          // 2秒後にホームへリダイレクト（完全リロード）
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.status?.message || '確認に失敗しました。');
        }
      } catch (error) {
        setStatus('error');
        setMessage('確認中にエラーが発生しました。');
        // エラーログ
        if (error instanceof Error) {
          setMessage(error.message);
        }
      }
    };

    confirmEmail();
  }, [searchParams]);

  const confirmationStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: "メール確認 | Today's Cocktails",
    description: 'ユーザーのメールアドレス確認状態を表示するページ',
  };

  return (
    <>
      <Seo
        title="メール確認"
        description="メールアドレスの認証が完了するとホーム画面にリダイレクトします。"
        path="/confirmation"
        noindex
        structuredData={confirmationStructuredData}
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">確認中...</p>
          </div>
        )}

          {status === 'success' && (
            <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">確認完了</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              ホームへ戻ってログイン
            </Button>
          </div>
        )}

          {status === 'error' && (
            <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">確認失敗</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              ホームへ戻る
            </Button>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
