import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = (name, fallback) => {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : fallback;
};

const SITE_URL = env('SITE_URL', env('VITE_SITE_URL', 'https://todayscocktails.com')).replace(/\/$/, '');
const API_BASE_URL = env('API_BASE_URL', env('VITE_API_BASE_URL', 'http://localhost:3000')).replace(/\/$/, '');
const PER_PAGE = Number.parseInt(env('SITEMAP_PER_PAGE', '100'), 10);

const STATIC_ROUTES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/confirmation', changefreq: 'monthly', priority: '0.4' },
];

const formatDate = (value) => {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
};

const buildUrlNode = ({ path: routePath, changefreq, priority, lastmod }) => {
  const loc = `${SITE_URL}${routePath === '/' ? '' : routePath}`;
  const lastmodValue = lastmod ?? new Date().toISOString();
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmodValue}</lastmod>`,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
};

async function fetchCocktailPage(page) {
  const url = `${API_BASE_URL}/api/v1/cocktails?page=${page}&per_page=${PER_PAGE}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Failed to fetch ${url} (${res.status}): ${text}`);
  }
  return res.json();
}

async function fetchAllCocktails() {
  const cocktails = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const data = await fetchCocktailPage(page);
    if (!Array.isArray(data.cocktails)) {
      throw new Error('Unexpected response: missing cocktails array');
    }

    cocktails.push(...data.cocktails);
    totalPages = data.meta?.total_pages ?? page;
    page += 1;
  }

  return cocktails;
}

async function generateSitemap() {
  const outputDir = path.join(__dirname, '..', 'public');
  await mkdir(outputDir, { recursive: true });

  const urlEntries = STATIC_ROUTES.map((route) =>
    buildUrlNode({ ...route, lastmod: new Date().toISOString() })
  );

  try {
    const cocktails = await fetchAllCocktails();
    cocktails.forEach((cocktail) => {
      const id = cocktail.id ?? cocktail.slug;
      if (!id) return;
      const routePath = `/cocktails/${id}`;
      urlEntries.push(
        buildUrlNode({
          path: routePath,
          changefreq: 'weekly',
          priority: '0.8',
          lastmod: formatDate(cocktail.updated_at ?? cocktail.created_at),
        })
      );
    });
  } catch (error) {
    console.error('[sitemap] Failed to fetch cocktail list, generating static routes only.');
    console.error(error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${urlEntries.join('\n')}\n` +
    `</urlset>\n`;

  const outputPath = path.join(outputDir, 'sitemap.xml');
  await writeFile(outputPath, xml, 'utf8');
  console.log(`[sitemap] Wrote ${urlEntries.length} url entries to ${outputPath}`);
}

try {
  await generateSitemap();
} catch (error) {
  console.error('[sitemap] Unexpected failure:', error);
  process.exitCode = 1;
}
