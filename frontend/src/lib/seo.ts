// ========================================================
// 🌐 siteMetadata.ts
// SEO / OGP 設定（Supabase + Vercel 対応）
// ========================================================

const FALLBACK_SITE_URL = 'https://todayscocktails.com';

type SiteMetadata = {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultKeywords: string;
  locale: string;
  themeColor: string;
  twitterHandle?: string;
  defaultOgImagePath: string;
  siteUrl: string;
};

export const siteMetadata: SiteMetadata = {
  siteName: "Today's Cocktail",
  defaultTitle: 'Today’s Cocktail - 人気カクテル図鑑&レシピ検索',
  defaultDescription:
    '定番からオリジナルまで、40種類以上のカクテルを検索・比較。ベースや味わい、アルコール度数で絞り込みながら、作り方や材料、カクテルの起源や由来まで楽しめます。',
  defaultKeywords:
    'カクテル,カクテルレシピ,カクテル検索,カクテル図鑑,バー,お酒,ミクソロジー,ベース,作り方,人気,ウイスキー,ジン,ラム,テキーラ,ウォッカ,リキュール,ノンアルコール,モクテル,歴史',
  locale: 'ja_JP',
  themeColor: '#0f172a',
  twitterHandle: import.meta.env.VITE_TWITTER_HANDLE ?? undefined,
  defaultOgImagePath: import.meta.env.VITE_DEFAULT_OG_IMAGE ?? '/ogp_image.png',
  siteUrl:
    (import.meta.env.VITE_SITE_URL as string | undefined) ?? FALLBACK_SITE_URL,
};

// ========================================================
// URL関連ヘルパー
// ========================================================

export const buildAbsoluteUrl = (path?: string | null): string => {
  if (!path) return siteMetadata.siteUrl.replace(/\/$/, '');
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedBase = siteMetadata.siteUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const getCanonicalUrl = (path?: string | null) =>
  buildAbsoluteUrl(path ?? '/');

export const getOgImageUrl = (image?: string | null) => {
  if (!image) {
    return buildAbsoluteUrl(siteMetadata.defaultOgImagePath);
  }
  return buildAbsoluteUrl(image);
};

export const absoluteUrl = (path?: string | null) =>
  buildAbsoluteUrl(path ?? '/');

export const getShareImageUrl = (path?: string | null) => getOgImageUrl(path);

// ========================================================
// 構造化データ（Structured Data）
// ========================================================

export type StructuredData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>;

/**
 * JSON-LD 形式の構造化データを生成
 * @example
 * generateStructuredData({
 *   "@context": "https://schema.org",
 *   "@type": "WebSite",
 *   name: siteMetadata.siteName,
 *   url: siteMetadata.siteUrl,
 *   description: siteMetadata.defaultDescription,
 * });
 */
export const generateStructuredData = (data: StructuredData): string =>
  JSON.stringify(data, null, 2);

// ========================================================
// Meta出力例（Reactコンポーネントで使用）
// ========================================================
/*
<meta property="og:title" content={title ?? siteMetadata.defaultTitle} />
<meta property="og:description" content={description ?? siteMetadata.defaultDescription} />
<meta property="og:image" content={getOgImageUrl(imagePath)} />
<meta property="og:url" content={getCanonicalUrl(path)} />
<meta property="og:type" content="website" />
<meta property="og:locale" content={siteMetadata.locale} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content={siteMetadata.twitterHandle} />
<meta name="theme-color" content={siteMetadata.themeColor} />
<link rel="canonical" href={getCanonicalUrl(path)} />
*/
