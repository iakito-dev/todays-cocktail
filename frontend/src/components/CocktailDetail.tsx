import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCocktail } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from './ui/separator';
import { Wine, GlassWater, Hammer, ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';
import type { Cocktail } from '../lib/types';

// 日本語ラベルのマッピング
const BASE_LABELS: Record<string, string> = {
  gin: 'ジン',
  rum: 'ラム',
  whisky: 'ウイスキー',
  vodka: 'ウォッカ',
  tequila: 'テキーラ',
  beer: 'ビール',
  wine: 'ワイン',
};

const STRENGTH_LABELS: Record<string, string> = {
  light: 'ライト',
  medium: 'ミディアム',
  strong: 'ストロング',
};

const TECHNIQUE_LABELS: Record<string, string> = {
  build: 'ビルド',
  stir: 'ステア',
  shake: 'シェイク',
};

const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200'
};

export function CocktailDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cocktail, setCocktail] = useState<Cocktail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('IDが指定されていません');
      setLoading(false);
      return;
    }

    fetchCocktail(id)
      .then(setCocktail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !cocktail) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            戻る
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">エラーが発生しました: {error || 'カクテルが見つかりませんでした'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-foreground p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 hover:bg-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">{cocktail.name}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`${strengthColors[cocktail.strength]} px-3 py-1 border`}>
                {STRENGTH_LABELS[cocktail.strength]}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 px-3 py-1">
                <Wine className="w-3 h-3" />
                {BASE_LABELS[cocktail.base]}
              </Badge>
            </div>
          </div>

          {/* Image */}
          {cocktail.image_url && (
            <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <ImageWithFallback
                src={cocktail.image_url}
                alt={cocktail.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Glass and Technique */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <GlassWater className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-gray-500">グラス</div>
                <div className="text-gray-900">{cocktail.glass || 'タンブラー'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 rounded-2xl bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Hammer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-gray-500">技法</div>
                <div className="text-gray-900">{TECHNIQUE_LABELS[cocktail.technique]}</div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Ingredients - サンプルデータ表示（後でバックエンドから取得） */}
          {cocktail.ingredients && cocktail.ingredients.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-gray-900">材料</h3>
              </div>
              <div className="space-y-2">
                {cocktail.ingredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-gray-900">{ingredient.name}</span>
                    <span className="text-gray-600 px-3 py-1 bg-white rounded-full">
                      {ingredient.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-6" />

          {/* Instructions */}
          {cocktail.instructions && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-gray-900">作り方</h3>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl">
                <p className="leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {cocktail.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="mb-2 text-blue-900">初心者の方へ</h4>
                <p className="text-blue-800 leading-relaxed">
                  このカクテルは{cocktail.strength === 'light' ? '飲みやすく、初心者の方にもおすすめです' : cocktail.strength === 'medium' ? '程よいアルコール度数で、カクテルの味わいを楽しめます' : 'アルコール度数が高めです。ゆっくり味わってお楽しみください'}。
                  {cocktail.technique === 'build' && 'グラスで直接作れるので、家でも簡単に作れます。'}
                  {cocktail.technique === 'shake' && 'シェイカーを使って本格的な味わいに。バーで注文するのもおすすめです。'}
                  {cocktail.technique === 'stir' && 'ミキシンググラスでステアして、滑らかな口当たりに。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
