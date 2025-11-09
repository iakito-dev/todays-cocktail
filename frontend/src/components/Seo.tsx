import { Helmet } from '@vuer-ai/react-helmet-async';
import { getCanonicalUrl, getOgImageUrl, siteMetadata, type StructuredData } from '../lib/seo';

type SeoProps = {
  title?: string;
  description?: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  twitterCard?: 'summary' | 'summary_large_image';
  structuredData?: StructuredData;
  publishedTime?: string;
  updatedTime?: string;
};

export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  twitterCard = 'summary_large_image',
  structuredData,
  publishedTime,
  updatedTime,
}: SeoProps) {
  const pageTitle = title
    ? `${title} | ${siteMetadata.siteName}`
    : `${siteMetadata.defaultTitle} | ${siteMetadata.siteName}`;
  const pageDescription = description ?? siteMetadata.defaultDescription;
  const canonicalUrl = getCanonicalUrl(path);
  const ogImage = getOgImageUrl(image);
  const robotsValue = noindex ? 'noindex,nofollow' : 'index,follow';
  const jsonLd = structuredData ? JSON.stringify(structuredData) : null;

  return (
    <Helmet prioritizeSeoTags>
      <html lang="ja" />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={siteMetadata.defaultKeywords} />
      <meta name="robots" content={robotsValue} />
      <meta name="theme-color" content={siteMetadata.themeColor} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={siteMetadata.siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={`${siteMetadata.siteName}のキービジュアル`} />
      <meta property="og:locale" content={siteMetadata.locale} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      {siteMetadata.twitterHandle && <meta name="twitter:site" content={siteMetadata.twitterHandle} />}

      {publishedTime && <meta property="article:published_time" content={new Date(publishedTime).toISOString()} />}
      {updatedTime && <meta property="article:modified_time" content={new Date(updatedTime).toISOString()} />}

      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      )}
    </Helmet>
  );
}
