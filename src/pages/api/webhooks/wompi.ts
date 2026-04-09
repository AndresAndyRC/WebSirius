import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const prerender = false;

// -- Tipos para el evento webhook de Wompi --

interface WompiTransaction {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
  amount_in_cents: number;
  currency: string;
  reference: string;
  customer_email: string;
  [key: string]: unknown;
}

interface WompiSignature {
  properties: string[];
  checksum: string;
}

interface WompiEvent {
  event: string;
  data: {
    transaction: WompiTransaction;
  };
  signature: WompiSignature;
  timestamp: number;
}

// -- Helper SHA-256 (Web Crypto API, compatible con Vercel Functions) --

async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// -- Validacion de firma del webhook --
// Wompi envia en event.signature.properties un arreglo dinamico con los nombres
// de las propiedades de la transaccion que se deben concatenar en orden,
// seguido del timestamp y el secreto de eventos.

async function verificarFirma(event: WompiEvent, secret: string): Promise<boolean> {
  const { properties, checksum } = event.signature;
  const transaction = event.data.transaction;

  const valores = properties.map((prop) => {
    const valor = transaction[prop as keyof WompiTransaction];
    return String(valor ?? '');
  });

  const cadena = valores.join('') + String(event.timestamp) + secret;
  const hashCalculado = await sha256(cadena);

  return hashCalculado === checksum;
}

// -- Handler principal del webhook --

export const POST: APIRoute = async ({ request }) => {
  const WOMPI_EVENT_SECRET = import.meta.env.WOMPI_EVENT_SECRET;

  if (!WOMPI_EVENT_SECRET) {
    console.error('[Wompi Webhook] WOMPI_EVENT_SECRET no esta configurado');
    return new Response(JSON.stringify({ error: 'Configuracion del servidor incompleta' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: WompiEvent;

  try {
    event = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Cuerpo de la solicitud invalido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Validar firma antes de procesar
  try {
    const firmaValida = await verificarFirma(event, WOMPI_EVENT_SECRET);
    if (!firmaValida) {
      console.warn('[Wompi Webhook] Firma invalida rechazada');
      return new Response(JSON.stringify({ error: 'Firma invalida' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('[Wompi Webhook] Error validando firma:', err);
    return new Response(JSON.stringify({ error: 'Error validando firma' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Procesar la transaccion
  const transaction = event.data.transaction;

  try {
    // Idempotencia: verificar si ya se proceso esta transaccion con el mismo estado
    const { data: existente } = await supabase
      .from('ordenes')
      .select('wompi_transaction_id, status')
      .eq('wompi_transaction_id', transaction.id)
      .single();

    if (existente && existente.status === transaction.status) {
      console.info(`[Wompi Webhook] Transaccion ${transaction.id} ya procesada con estado ${transaction.status}`);
      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Upsert: insertar o actualizar la orden en Supabase
    const { error: upsertError } = await supabase
      .from('ordenes')
      .upsert(
        {
          reference: transaction.reference,
          status: transaction.status,
          amount_in_cents: transaction.amount_in_cents,
          currency: transaction.currency,
          wompi_transaction_id: transaction.id,
          customer_email: transaction.customer_email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'wompi_transaction_id' }
      );

    if (upsertError) {
      console.error('[Wompi Webhook] Error al guardar orden:', upsertError);
      // Retornar 200 para evitar reintentos de Wompi por errores no transitorios
      return new Response(JSON.stringify({ received: true, processing_error: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.info(`[Wompi Webhook] Orden ${transaction.reference} actualizada: ${transaction.status}`);
  } catch (err) {
    console.error('[Wompi Webhook] Error inesperado:', err);
    return new Response(JSON.stringify({ received: true, processing_error: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
