/**
 * src/lib/shopify.ts
 * ───────────────────────────────────────────────────────────────────────────
 * MODO DEMO DE PORTAFOLIO — DESCONECTADO DE SHOPIFY.
 *
 * Este módulo conserva exactamente la misma API pública que la integración
 * original con la Storefront API de Shopify (getAllProducts, getProductByHandle,
 * getCollectionByHandle, toLegacyProduct, createCart), pero NO realiza ninguna
 * llamada de red ni requiere credenciales. Los datos provienen de un catálogo
 * ficticio local (`src/data/demoCatalog.ts`).
 *
 * Motivo: el proyecto no fue aceptado por el cliente; se conserva como demo de
 * portafolio sin afectar su tienda real. El checkout está deshabilitado.
 *
 * Para reconectar a Shopify en el futuro, restaura la versión de red de este
 * archivo desde el historial de git (commit anterior a la conversión a demo).
 */
import { DEMO_PRODUCTS, demoProductByHandle, demoCollectionProducts } from '../data/demoCatalog';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  sku: string | null;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
}

export interface ShopifyMetafield {
  namespace: string;
  key: string;
  type: string;
  value: string;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  tags: string[];
  productType: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: ShopifyImage[];
  variants: ShopifyVariant[];
  metafields: (ShopifyMetafield | null)[];
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: ShopifyImage | null;
  products: ShopifyProduct[];
}

// ─── Rich text (Shopify) → HTML ────────────────────────────────────────────
// Shopify devuelve los metafields tipo "rich_text_field" como JSON con un AST
// (root → paragraph/heading/list → text). Convertimos a HTML para inyectarlo
// en el template con set:html.

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function richTextNodeToHtml(node: any): string {
  if (!node) return '';
  switch (node.type) {
    case 'root':
      return (node.children || []).map(richTextNodeToHtml).join('');
    case 'paragraph':
      return `<p>${(node.children || []).map(richTextNodeToHtml).join('')}</p>`;
    case 'heading': {
      const level = Math.min(Math.max(node.level || 2, 1), 6);
      return `<h${level}>${(node.children || []).map(richTextNodeToHtml).join('')}</h${level}>`;
    }
    case 'list': {
      const tag = node.listType === 'ordered' ? 'ol' : 'ul';
      return `<${tag}>${(node.children || []).map(richTextNodeToHtml).join('')}</${tag}>`;
    }
    case 'list-item':
      return `<li>${(node.children || []).map(richTextNodeToHtml).join('')}</li>`;
    case 'link': {
      const url = escapeHtml(node.url || '#');
      const target = node.target ? ` target="${escapeHtml(node.target)}" rel="noopener"` : '';
      const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
      return `<a href="${url}"${target}${title}>${(node.children || []).map(richTextNodeToHtml).join('')}</a>`;
    }
    case 'text': {
      let txt = escapeHtml(node.value || '');
      if (node.bold) txt = `<strong>${txt}</strong>`;
      if (node.italic) txt = `<em>${txt}</em>`;
      return txt;
    }
    default:
      return (node.children || []).map(richTextNodeToHtml).join('');
  }
}

export function richTextToHtml(jsonValue: string | null | undefined): string {
  if (!jsonValue) return '';
  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
    return richTextNodeToHtml(parsed);
  } catch {
    return '';
  }
}

function richTextToPlainText(jsonValue: string | null | undefined): string {
  if (!jsonValue) return '';
  try {
    const parsed = typeof jsonValue === 'string' ? JSON.parse(jsonValue) : jsonValue;
    const walk = (n: any): string => {
      if (!n) return '';
      if (n.type === 'text') return n.value || '';
      return (n.children || []).map(walk).join(' ');
    };
    return walk(parsed).replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

function metafieldByKey(metafields: any[] | null | undefined, key: string): string | null {
  if (!metafields) return null;
  const found = metafields.find((m: any) => m && m.key === key);
  return found?.value || null;
}

// ─── Public API (modo demo: datos locales, sin red) ─────────────────────────
// Mantienen las mismas firmas que la versión Shopify; ahora leen del catálogo
// ficticio en `src/data/demoCatalog.ts`.

import { COLLECTIONS } from '../data/colecciones';

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  return DEMO_PRODUCTS;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  return demoProductByHandle(handle);
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const products = demoCollectionProducts(handle);
  if (!products) return null;

  const meta = COLLECTIONS.find(c => c.id === handle);
  return {
    id: `gid://shopify/Collection/demo-${handle}`,
    handle,
    title: meta?.name || handle,
    description: meta?.description || '',
    image: null,
    products,
  };
}

// ─── Legacy adapter ─────────────────────────────────────────────────────────
// Convierte un ShopifyProduct al shape que usaba el repo con Supabase.
// Esto deja SEO components y templates funcionando sin reescribir.
// Los campos derivados de metafields (specs, faqs, garantia, beneficios_html,
// aplicaciones_html) quedan vacíos hasta el Bloque D.

export interface LegacyProduct {
  slug: string;
  title: string;
  vendor: string;
  sku: string;
  price: string;
  images: string[];
  tags: string[];
  main_description_html: string;
  specs: { label: string; value: string }[];
  faqs: { pregunta: string; respuesta: string }[];
  garantia: string;
  beneficios_html: string;
  aplicaciones_html: string;
  // Bloques nuevos derivados de los metafields rich-text de Shopify.
  caracteristicas_html: string;
  faq_html: string;
  garantia_html: string;
  variant_id: string;
  available: boolean;
}

export function toLegacyProduct(p: ShopifyProduct): LegacyProduct {
  const defaultVariant = p.variants[0];

  // Metafields rich text → HTML (vacío si Storefront access apagado o producto sin valor).
  const descripcionHtml = richTextToHtml(metafieldByKey(p.metafields, 'descripci_n'));
  const faqHtml = richTextToHtml(metafieldByKey(p.metafields, 'preguntas_frecuentes'));
  const garantiaHtml = richTextToHtml(metafieldByKey(p.metafields, 'garant_a_del_producto'));
  const caracteristicasHtml = richTextToHtml(metafieldByKey(p.metafields, 'caracter_sticas_t_cnicas'));
  const garantiaPlain = richTextToPlainText(metafieldByKey(p.metafields, 'garant_a_del_producto'));

  return {
    slug: p.handle,
    title: p.title,
    vendor: p.vendor || 'SIRIUS',
    sku: defaultVariant?.sku || '',
    price: p.priceRange.minVariantPrice.amount,
    images: p.images.map(i => i.url),
    tags: p.tags,
    // Preferimos el metafield "Descripción" (rico) sobre la descripción nativa.
    main_description_html: descripcionHtml || p.descriptionHtml,
    // Sin specs estructurados todavía (los metafields actuales son rich text, no key/value).
    specs: [],
    // Sin FAQs estructuradas (rich text → render como bloque HTML, no accordion).
    faqs: [],
    // garantia (texto plano) sigue alimentando el trust badge corto.
    garantia: garantiaPlain,
    beneficios_html: '',
    aplicaciones_html: '',
    caracteristicas_html: caracteristicasHtml,
    faq_html: faqHtml,
    garantia_html: garantiaHtml,
    variant_id: defaultVariant?.id || '',
    available: p.availableForSale,
  };
}

/**
 * MODO DEMO: el checkout está deshabilitado. Esta función ya no contacta a
 * Shopify; lanzar siempre evita que cualquier flujo cree pedidos reales en la
 * tienda del cliente. La UI del carrito sigue funcionando, pero al ir a pagar
 * se muestra un aviso de demostración (ver `src/pages/checkout.astro`).
 */
export async function createCart(
  _lines: { merchandiseId: string; quantity: number }[],
): Promise<{ id: string; checkoutUrl: string }> {
  throw new Error('Checkout deshabilitado: este es un demo de portafolio, no se procesan pedidos.');
}
