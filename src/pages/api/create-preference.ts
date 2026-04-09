import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabase';
import cupones from '../../data/cupones.json';

export const prerender = false;

// Dummy Helper for SHA-256. In 2026, Web Crypto API is natively available in Vercel Edge/Node
async function generateWompiSignature(reference: string, amountInCents: number, currency: string, secret: string) {
  const dataString = `${reference}${amountInCents}${currency}${secret}`;
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback Node crypto
    const cryptoNode = await import('crypto');
    return cryptoNode.createHash('sha256').update(dataString).digest('hex');
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { items, couponCode } = body;

    // Validate inputs
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'El carrito está vacío o es inválido' }), { status: 400 });
    }

    // Calcula el total real consultando Supabase para evitar manipulación del lado del cliente
    // Batch query: 1 round-trip en lugar de N (resuelve problema N+1)
    const slugs = items.map((i: { slug: string }) => i.slug);
    const { data: productos, error } = await supabase
      .from('productos')
      .select('slug, price')
      .in('slug', slugs);

    if (error || !productos) {
      return new Response(JSON.stringify({ error: 'Error al consultar los productos.' }), { status: 500 });
    }

    const priceMap = new Map<string, number>(
      productos.map((p: { slug: string; price: string }) => [p.slug, parseFloat(p.price)])
    );

    // Detectar productos fantasma: slugs del carrito que no existen en la BD
    for (const item of items) {
      if (!priceMap.has(item.slug)) {
        return new Response(JSON.stringify({ error: `El producto ${item.title || item.slug} no existe o no está disponible.` }), { status: 404 });
      }
    }

    let total = 0;
    for (const item of items) {
      total += (priceMap.get(item.slug)! * item.quantity);
    }

    // Aplicar descuento en el servidor de forma segura
    if (couponCode) {
      const cupon = cupones.find((c) => c.codigo === couponCode.trim().toUpperCase());
      if (cupon && cupon.activo) {
        if (cupon.tipo === 'porcentaje') {
          total = total - (total * (cupon.valor / 100));
        } else if (cupon.tipo === 'fijo') {
          total = total - cupon.valor;
        }
      }
    }

    total = Math.max(0, total); // Evita totales negativos

    // Reference logic (must be unique per transaction)
    const reference = `SIRIUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const currency = 'COP';
    const amountInCents = Math.floor(total * 100);
    
    // In production, this should NEVER be hardcoded. 
    // It should be process.env.WOMPI_INTEGRITY_SECRET managed securely via Vercel for PCI DSS v4.0 routing.
    const integritySecret = import.meta.env.WOMPI_INTEGRITY_SECRET || 'test_integrity_XXXXXXXXXXXXXX';

    const signature = await generateWompiSignature(reference, amountInCents, currency, integritySecret);

    return new Response(JSON.stringify({ 
      success: true, 
      reference,
      signature,
      amountInCents,
      currency,
      publicKey: import.meta.env.WOMPI_PUBLIC_KEY || 'pub_test_XXXXXXXXXXXXX'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno generando preferencia Wompi' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
