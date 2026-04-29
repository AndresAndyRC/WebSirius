import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getAllProducts } from '../lib/shopify';
import { COLLECTIONS } from '../data/colecciones';

const SITE = 'https://siriuscol.com';

interface Url {
  loc: string;
  changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
  lastmod?: string;
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlTag(u: Url): string {
  const lastmod = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
  return `  <url>
    <loc>${xmlEscape(u.loc)}</loc>${lastmod}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().slice(0, 10);

  const staticUrls: Url[] = [
    { loc: `${SITE}/`,            changefreq: 'weekly',  priority: '1.0', lastmod: today },
    { loc: `${SITE}/colecciones`, changefreq: 'weekly',  priority: '0.9', lastmod: today },
    { loc: `${SITE}/blog`,        changefreq: 'weekly',  priority: '0.8', lastmod: today },
    { loc: `${SITE}/faqs`,        changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE}/contacto`,    changefreq: 'monthly', priority: '0.7' },
  ];

  const collectionUrls: Url[] = COLLECTIONS.map((c) => ({
    loc: `${SITE}/colecciones/${c.id}`,
    changefreq: 'weekly',
    priority: '0.8',
  }));

  let productUrls: Url[] = [];
  try {
    const products = await getAllProducts();
    productUrls = products
      .filter((p) => p.availableForSale)
      .map((p) => ({
        loc: `${SITE}/productos/${p.handle}`,
        changefreq: 'weekly',
        priority: '0.7',
      }));
  } catch (e) {
    console.error('[sitemap] error fetching products from Shopify:', e);
  }

  let blogUrls: Url[] = [];
  try {
    const posts = await getCollection('blog');
    blogUrls = posts.map((p: any) => ({
      loc: `${SITE}/blog/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: p.data?.modifiedDate || p.data?.publishedDate,
    }));
  } catch (e) {
    console.error('[sitemap] error reading blog content:', e);
  }

  const all = [...staticUrls, ...collectionUrls, ...productUrls, ...blogUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(urlTag).join('\n')}
</urlset>
`;

  return new Response(xml, {
    status: 200,
    headers: { 'content-type': 'application/xml; charset=utf-8' },
  });
};
