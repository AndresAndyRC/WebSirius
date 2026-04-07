import type { APIRoute } from 'astro';

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
    const { total, items } = body;

    // Validate inputs
    if (!total || typeof total !== 'number') {
      return new Response(JSON.stringify({ error: 'Monto inválido' }), { status: 400 });
    }

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
