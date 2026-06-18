import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * MODO DEMO DE PORTAFOLIO — checkout deshabilitado.
 *
 * Este endpoint ya NO contacta a Shopify ni crea carritos/pedidos reales.
 * Responde con un aviso de demostración para que ningún flujo (ni una llamada
 * directa) pueda generar una orden en la tienda del cliente.
 */
export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      demo: true,
      error: 'Checkout deshabilitado: este es un demo de portafolio. No se procesan pedidos.',
    }),
    { status: 503, headers: { 'content-type': 'application/json' } },
  );
};
