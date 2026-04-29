import { createStorefrontApiClient } from '@shopify/storefront-api-client';

const storeDomain = import.meta.env.PUBLIC_SHOPIFY_STORE_DOMAIN;
const publicAccessToken = import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = import.meta.env.PUBLIC_SHOPIFY_API_VERSION || '2024-10';

if (!storeDomain || !publicAccessToken) {
  throw new Error('Missing Shopify Storefront API env vars (PUBLIC_SHOPIFY_STORE_DOMAIN, PUBLIC_SHOPIFY_STOREFRONT_TOKEN)');
}

const client = createStorefrontApiClient({
  storeDomain,
  apiVersion,
  publicAccessToken,
});

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

// ─── Fragments / Queries ────────────────────────────────────────────────────

// Metafields que queremos del producto. Mantén este array sincronizado con
// los pares namespace.key configurados en Shopify Admin → Custom data → Products.
const PRODUCT_METAFIELDS = [
  { namespace: 'custom', key: 'descripci_n' },                  // Descripción
  { namespace: 'custom', key: 'preguntas_frecuentes' },         // FAQ
  { namespace: 'custom', key: 'garant_a_del_producto' },        // Garantía
  { namespace: 'custom', key: 'caracter_sticas_t_cnicas' },     // Características Técnicas
];

const METAFIELDS_IDENTIFIERS_LITERAL = JSON.stringify(PRODUCT_METAFIELDS).replace(/"([^"]+)":/g, '$1:');

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    descriptionHtml
    vendor
    tags
    productType
    availableForSale
    priceRange { minVariantPrice { amount currencyCode } }
    images(first: 10) { edges { node { url altText } } }
    variants(first: 25) {
      edges {
        node {
          id
          sku
          availableForSale
          price { amount currencyCode }
        }
      }
    }
    metafields(identifiers: ${METAFIELDS_IDENTIFIERS_LITERAL}) {
      namespace
      key
      type
      value
    }
  }
`;

const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query AllProducts($cursor: String) {
    products(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges { node { ...ProductFields } }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) { ...ProductFields }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query CollectionByHandle($handle: String!, $cursor: String) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      image { url altText }
      products(first: 250, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges { node { ...ProductFields } }
      }
    }
  }
`;

const CREATE_CART_MUTATION = /* GraphQL */ `
  mutation CreateCart($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart { id checkoutUrl }
      userErrors { field message }
    }
  }
`;

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

// ─── Normalizers ────────────────────────────────────────────────────────────

function normalizeProduct(node: any): ShopifyProduct {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    descriptionHtml: node.descriptionHtml || '',
    vendor: node.vendor || '',
    tags: node.tags || [],
    productType: node.productType || '',
    availableForSale: node.availableForSale,
    priceRange: node.priceRange,
    images: (node.images?.edges || []).map((e: any) => ({
      url: e.node.url,
      altText: e.node.altText,
    })),
    variants: (node.variants?.edges || []).map((e: any) => ({
      id: e.node.id,
      sku: e.node.sku,
      availableForSale: e.node.availableForSale,
      price: e.node.price,
    })),
    metafields: node.metafields || [],
  };
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];
  let cursor: string | null = null;

  while (true) {
    const { data, errors } = await client.request(ALL_PRODUCTS_QUERY, {
      variables: { cursor },
    });
    if (errors) throw new Error(`Shopify getAllProducts: ${JSON.stringify(errors)}`);

    const edges = data?.products?.edges || [];
    for (const e of edges) all.push(normalizeProduct(e.node));

    if (!data?.products?.pageInfo?.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }

  return all;
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const { data, errors } = await client.request(PRODUCT_BY_HANDLE_QUERY, {
    variables: { handle },
  });
  if (errors) throw new Error(`Shopify getProductByHandle(${handle}): ${JSON.stringify(errors)}`);
  return data?.product ? normalizeProduct(data.product) : null;
}

export async function getCollectionByHandle(handle: string): Promise<ShopifyCollection | null> {
  const products: ShopifyProduct[] = [];
  let cursor: string | null = null;
  let head: any = null;

  while (true) {
    const { data, errors } = await client.request(COLLECTION_BY_HANDLE_QUERY, {
      variables: { handle, cursor },
    });
    if (errors) throw new Error(`Shopify getCollectionByHandle(${handle}): ${JSON.stringify(errors)}`);

    if (!data?.collection) return null;
    if (!head) head = data.collection;

    const edges = data.collection.products?.edges || [];
    for (const e of edges) products.push(normalizeProduct(e.node));

    if (!data.collection.products?.pageInfo?.hasNextPage) break;
    cursor = data.collection.products.pageInfo.endCursor;
  }

  return {
    id: head.id,
    handle: head.handle,
    title: head.title,
    description: head.description || '',
    image: head.image ? { url: head.image.url, altText: head.image.altText } : null,
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

export async function createCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<{ id: string; checkoutUrl: string }> {
  const { data, errors } = await client.request(CREATE_CART_MUTATION, {
    variables: { lines },
  });
  if (errors) throw new Error(`Shopify createCart: ${JSON.stringify(errors)}`);

  const userErrors = data?.cartCreate?.userErrors || [];
  if (userErrors.length > 0) {
    throw new Error(`Shopify createCart user errors: ${JSON.stringify(userErrors)}`);
  }

  const cart = data?.cartCreate?.cart;
  if (!cart) throw new Error('Shopify createCart: no cart returned');

  return { id: cart.id, checkoutUrl: cart.checkoutUrl };
}
