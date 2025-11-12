import type { Cocktail } from '../../../lib/types';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Wine } from 'lucide-react';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';
import { FavoriteButton } from './FavoriteButton';
import { prefetchCocktail } from '../../../lib/api';

// =======================================
// Props
// =======================================
// イベントハンドラや表示切り替えフラグを型で縛り、親子間の契約を明確にする
interface CocktailCardProps {
  cocktail: Cocktail; // 表示対象のカクテル情報
  onViewDetails: (cocktail: Cocktail) => void; // 詳細ダイアログを開くためのコールバック
  onFavoriteToggle?: (cocktailId: number) => void; // お気に入りトグル用コールバック
  isFavorited?: boolean; // お気に入り状態表示フラグ
  showFavoriteButton?: boolean; // ボタン自体を描画するかどうか
}

// =======================================
// 表示用定数
// =======================================
// Tailwindクラスとラベルを辞書化しておき、JSX内での条件分岐を平易にする
const strengthColors = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200',
};

const strengthLabels = {
  light: 'ライト',
  medium: 'ミディアム',
  strong: 'ストロング',
};

const baseLabels = {
  gin: 'ジン',
  rum: 'ラム',
  whisky: 'ウイスキー',
  vodka: 'ウォッカ',
  tequila: 'テキーラ',
  beer: 'ビール',
  wine: 'ワイン',
};

const techniqueLabels = {
  build: 'ビルド',
  stir: 'ステア',
  shake: 'シェイク',
};

// =======================================
// Component
// =======================================
// カード上で視覚情報と操作をまとめ、タップひとつで詳細表示とお気に入り制御を提供する
export function CocktailCard({
  cocktail,
  onViewDetails,
  onFavoriteToggle,
  isFavorited = false,
  showFavoriteButton = false,
}: CocktailCardProps) {
  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden border bg-white border-gray-200 rounded-2xl"
      onClick={() => onViewDetails(cocktail)}
      onMouseEnter={() => prefetchCocktail(cocktail.id)}
      onFocus={() => prefetchCocktail(cocktail.id)}
    >
      {/* ================================
          画像エリア
          relative指定でバッジを重ね、hover時の拡大で視線を誘導する
         ================================ */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={cocktail.image_url || ''}
          alt={cocktail.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />

        {/* お気に入りボタン：左上固定で親指操作しやすい位置に置く */}
        {showFavoriteButton && onFavoriteToggle && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10">
            <FavoriteButton
              isFavorited={isFavorited}
              onToggle={() => onFavoriteToggle(cocktail.id)}
              size="sm"
            />
          </div>
        )}

        {/* 強度バッジ：右上に重ね、Tailwindクラスで色分けする */}
        <div className="absolute top-2 right-2 md:top-3 md:right-3">
          <Badge
            className={`${strengthColors[cocktail.strength] ?? strengthColors['light']} shadow-sm text-xs`}
          >
            {strengthLabels[cocktail.strength] ?? strengthLabels['light']}
          </Badge>
        </div>
      </div>

      {/* ================================
          本文エリア
          タイトル・ベース・技法を縦→横の順で並べ、情報を整理する
         ================================ */}
      <CardContent className="p-3 md:p-5">
        {/* タイトル行：日本語名がある場合は英名を補助表示する */}
        <div className="mb-2 md:mb-3 min-h-[2.5rem] md:min-h-[3rem]">
          <h3 className="text-sm md:text-base text-gray-900 font-bold line-clamp-1 leading-tight">
            {cocktail.name_ja || cocktail.name}
          </h3>
          {cocktail.name_ja && (
            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-0.5">
              {cocktail.name}
            </p>
          )}
        </div>

        {/* 属性行：左にベース、右に技法を配置し、視線移動を最小化する */}
        <div className="flex items-center justify-between text-xs md:text-sm">
          <div className="flex items-center gap-1.5 md:gap-2 text-gray-600">
            <Wine className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>{baseLabels[cocktail.base]}</span>
          </div>
          <span className="text-gray-500">
            {techniqueLabels[
              cocktail.technique as keyof typeof techniqueLabels
            ] ?? cocktail.technique}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
