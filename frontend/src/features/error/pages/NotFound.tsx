import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Seo } from '../../../components/layout/Seo';

// =======================================
// Component
// =======================================
export function NotFound() {
  return (
    <>
      <Seo
        title="ページが見つかりません"
        description="お探しのページは見つかりませんでした。"
        path="/404"
        noindex={true}
      />
      <main className="min-h-[60vh] flex items-center justify-center px-6 py-16">
        <Card className="max-w-md w-full shadow-lg">
          <CardContent className="pt-12 pb-8 px-8 text-center space-y-6">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold text-gray-900">404</h1>
              <h2 className="text-2xl font-semibold text-gray-800">
                ページが見つかりません
              </h2>
              <p className="text-gray-600 mt-4">
                お探しのページは存在しないか、移動または削除された可能性があります。
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow"
              >
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  トップページへ
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
