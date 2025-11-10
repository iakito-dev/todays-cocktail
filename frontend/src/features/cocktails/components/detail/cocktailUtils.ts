import type { Cocktail } from '../../../../lib/types';

// =======================================
// 表示ラベル
// =======================================
export const BASE_LABELS: Record<string, string> = {
  gin: 'ジン',
  rum: 'ラム',
  whisky: 'ウイスキー',
  vodka: 'ウォッカ',
  tequila: 'テキーラ',
  beer: 'ビール',
  wine: 'ワイン',
};

export const STRENGTH_LABELS: Record<string, string> = {
  light: 'ライト',
  medium: 'ミディアム',
  strong: 'ストロング',
};

export const TECHNIQUE_LABELS: Record<string, string> = {
  build: 'ビルド',
  stir: 'ステア',
  shake: 'シェイク',
};

export const strengthColors: Record<string, string> = {
  light: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  strong: 'bg-red-100 text-red-800 border-red-200',
};

// =======================================
// 説明文テンプレート
// =======================================
const BASE_STORIES: Record<string, string> = {
  gin: 'ハーバルなジンの香りが澄んだ余韻を生み、シトラスの清涼感が心地よく続きます。',
  rum: 'トロピカルなラムの甘みとスパイスが重なり、やわらかな南国の空気を感じさせます。',
  whisky:
    '熟成したウイスキーの厚みがしっとり広がり、樽香が穏やかな余裕を与えます。',
  vodka:
    'ピュアなウォッカの透明感が素材の味を引き立て、すっきりとした後味に仕上がります。',
  tequila:
    'アガベ由来の力強い香りにライムの爽快さが重なり、陽気で鮮烈な印象を残します。',
  beer: '麦芽の旨味と軽やかな泡が同時に広がり、食事とも合わせやすい柔らかさがあります。',
  wine: '果実味豊かなワインのアロマがふくらみ、酸味と渋みのバランスが上品に整います。',
};

const STRENGTH_STORIES: Record<string, string> = {
  light:
    '軽やかな飲み口で最初の一杯にも選びやすく、リフレッシュしたい時にぴったりです。',
  medium:
    '甘味とアルコールの輪郭がちょうど良く、ゆっくり味がほどけていきます。',
  strong:
    'しっかりとしたアルコールの厚みがあり、落ち着いた夜に寄り添う存在感があります。',
};

const TECHNIQUE_STORIES: Record<string, string> = {
  build:
    'グラスの中で材料を重ねることで、香りが穏やかに立ち上がり素材の輪郭を感じられます。',
  stir: '氷でしっかりステアすることで、透明感のある口当たりと澄んだ味わいに仕上がります。',
  shake:
    'シェイカーに空気を含ませながら振ることで、ふくよかで冷たい一体感が生まれます。',
};

export const getProvidedText = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed?.length ? trimmed : null;
};

// 既存の説明がない場合に、ベース・強度・技法のテンプレから文章を生成
export const buildDefaultDescription = (cocktail: Cocktail | null) => {
  if (!cocktail) return null;
  const baseStory =
    BASE_STORIES[cocktail.base] ??
    '素材の持つ香りを素直に引き出し、口いっぱいに優雅な余韻が広がります。';
  const strengthStory =
    STRENGTH_STORIES[cocktail.strength] ??
    '飲み進めるほどに調和が増し、余白のある味わいになります。';
  const techniqueStory =
    TECHNIQUE_STORIES[cocktail.technique] ??
    '丁寧な仕上げによって、香りと温度が最適なバランスに整います。';
  return [
    baseStory,
    strengthStory,
    techniqueStory,
    '静かな時間にも、特別なひとときを演出したい時にも寄り添ってくれる一杯です。',
  ].join(' ');
};

// 作り方テキストも同様に、手元の情報から推測で埋める
export const buildDefaultInstructions = (cocktail: Cocktail | null) => {
  if (!cocktail) return '';
  const glassLabel = cocktail.glass_ja || cocktail.glass || 'グラス';
  const baseLabel = BASE_LABELS[cocktail.base] || 'スピリッツ';

  const techniqueStep = (() => {
    switch (cocktail.technique) {
      case 'stir':
        return `ミキシンググラスに氷を入れ、${baseLabel}と甘味、ビターズを加えて静かにステアし香りと温度を整えます。`;
      case 'shake':
        return `シェイカーに${baseLabel}と果汁、シロップを入れてしっかり冷えるまで振り、空気を含ませて滑らかに仕上げます。`;
      default:
        return `${glassLabel}に氷を満たし、${baseLabel}と副材料を順に注いで軽くステアしながら全体を馴染ませます。`;
    }
  })();

  return `${techniqueStep} 香りがまとまったら${glassLabel}に注ぎ、お好みで柑橘のピールやハーブを飾って完成です。`;
};
