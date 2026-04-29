import type { APIRoute } from 'astro';
import { createCart } from '../../lib/shopify';

export const prerender = false;

interface CartLine {
  merchandiseId: string;
  quantity: number;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const lines: CartLine[] = body?.lines || [];

    if (!Array.isArray(lines) || lines.length === 0) {
      return new Response(JSON.stringify({ error: 'No cart lines provided' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    for (const line of lines) {
      if (!line.merchandiseId || !line.quantity || line.quantity < 1) {
        return new Response(
          JSON.stringify({ error: `Invalid line: ${JSON.stringify(line)}` }),
          { status: 400, headers: { 'content-type': 'application/json' } },
        );
      }
    }

    const { id, checkoutUrl } = await createCart(lines);

    return new Response(JSON.stringify({ id, checkoutUrl }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Unexpected error' }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    );
  }
};
