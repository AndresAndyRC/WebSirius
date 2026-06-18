/**
 * src/data/demoCatalog.ts
 * ───────────────────────────────────────────────────────────────────────────
 * Catálogo de DEMOSTRACIÓN para portafolio.
 *
 * Este proyecto YA NO está conectado a la cuenta de Shopify del cliente.
 * Todos los productos aquí son ficticios y autogenerados a partir de las
 * colecciones definidas en `colecciones.ts`. Las imágenes son placeholders SVG
 * embebidos (sin red), así el sitio se ve completo sin contactar ningún backend.
 *
 * Si en el futuro se quisiera reconectar a Shopify, basta con restaurar las
 * funciones de red en `src/lib/shopify.ts` (ver git history) y dejar de usar
 * este archivo.
 */
import type { ShopifyProduct } from '../lib/shopify';
import { COLLECTIONS } from './colecciones';

// Colores de acento por categoría (coinciden con el tema del catálogo).
const CATEGORY_COLOR: Record<string, string> = {
  iluminacion: '#F5A623',
  electrico: '#00C2FF',
  exterior: '#4ADE80',
  hogar: '#F472B6',
  especial: '#8B5CF6',
};

// Descriptores de variante por categoría → dan nombres realistas a los productos.
const CATEGORY_VARIANTS: Record<string, string[]> = {
  iluminacion: ['9W 3000K', '15W 4000K', '24W 6500K'],
  electrico: ['Calibre 12', 'Calibre 14', 'Kit Profesional'],
  exterior: ['Solar 100W', 'Solar 200W', 'con Sensor de Movimiento'],
  hogar: ['Acabado Cromo', 'Acero Inoxidable', 'Negro Mate'],
  especial: ['Compacto', 'Estándar', 'Premium'],
};
const DEFAULT_VARIANTS = ['Estándar', 'Pro', 'Premium'];

// Rango de precios (COP) por categoría: [base, incremento por variante].
const CATEGORY_PRICE: Record<string, [number, number]> = {
  iluminacion: [38900, 22000],
  electrico: [54900, 31000],
  exterior: [89900, 45000],
  hogar: [69900, 38000],
  especial: [49900, 27000],
};
const DEFAULT_PRICE: [number, number] = [44900, 25000];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Imagen placeholder autocontenida (data URI SVG) con glow y título. */
function placeholderImage(title: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <radialGradient id="g" cx="50%" cy="36%" r="68%">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.55"/>
      <stop offset="42%" stop-color="${color}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#0b0d12" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="900" fill="#0b0d12"/>
  <rect width="900" height="900" fill="url(#g)"/>
  <circle cx="450" cy="330" r="95" fill="${color}" opacity="0.92"/>
  <circle cx="450" cy="330" r="160" fill="none" stroke="${color}" stroke-opacity="0.45" stroke-width="2"/>
  <circle cx="450" cy="330" r="220" fill="none" stroke="${color}" stroke-opacity="0.18" stroke-width="2"/>
  <text x="450" y="600" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#ffffff" text-anchor="middle">${escapeXml(title)}</text>
  <text x="450" y="660" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#9aa3b2" text-anchor="middle">SIRIUS · Demo de portafolio</text>
</svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function buildProduct(
  collection: (typeof COLLECTIONS)[number],
  variantLabel: string,
  ci: number,
  vi: number,
): ShopifyProduct {
  const color = CATEGORY_COLOR[collection.category] || '#F5A623';
  const [base, step] = CATEGORY_PRICE[collection.category] || DEFAULT_PRICE;
  const amount = String(base + step * vi);
  const title = `${collection.name} — ${variantLabel}`;
  const handle = `${collection.id}-${vi + 1}`;
  const sku = `SIR-${String(ci + 1).padStart(2, '0')}-${vi + 1}`;
  const variantId = `gid://shopify/ProductVariant/demo-${handle}`;

  const descriptionHtml = `
    <p>${escapeXml(collection.name)} en su versión <strong>${escapeXml(variantLabel)}</strong>. ${escapeXml(collection.description)}</p>
    <ul>
      <li>Garantía SIRIUS de 2 años</li>
      <li>Eficiencia energética clase A+</li>
      <li>Envío a toda Colombia</li>
    </ul>
    <p><em>Producto de demostración — catálogo ficticio para portafolio.</em></p>`.trim();

  return {
    id: `gid://shopify/Product/demo-${handle}`,
    handle,
    title,
    descriptionHtml,
    vendor: 'SIRIUS',
    tags: collection.tags,
    productType: collection.category,
    availableForSale: true,
    priceRange: { minVariantPrice: { amount, currencyCode: 'COP' } },
    images: [
      { url: placeholderImage(collection.name, color), altText: title },
      { url: placeholderImage(variantLabel, color), altText: `${title} (detalle)` },
    ],
    variants: [
      {
        id: variantId,
        sku,
        availableForSale: true,
        price: { amount, currencyCode: 'COP' },
      },
    ],
    metafields: [],
  };
}

// ── Generación del catálogo demo ─────────────────────────────────────────────
// Mapa handle-de-colección → productos, y lista plana de todos los productos.

const collectionProducts = new Map<string, ShopifyProduct[]>();
const allProducts: ShopifyProduct[] = [];

COLLECTIONS.forEach((collection, ci) => {
  const variants = CATEGORY_VARIANTS[collection.category] || DEFAULT_VARIANTS;
  const products = variants.map((label, vi) => buildProduct(collection, label, ci, vi));
  collectionProducts.set(collection.id, products);
  allProducts.push(...products);
});

export const DEMO_PRODUCTS: ShopifyProduct[] = allProducts;

export function demoProductByHandle(handle: string): ShopifyProduct | null {
  return allProducts.find(p => p.handle === handle) || null;
}

export function demoCollectionProducts(handle: string): ShopifyProduct[] | null {
  return collectionProducts.get(handle) || null;
}
