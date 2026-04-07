import type { APIRoute } from 'astro';
import cupones from '../../data/cupones.json';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const codigo = data?.code?.toString().toUpperCase().trim();

    if (!codigo) {
      return new Response(JSON.stringify({ error: 'Debes ingresar un código' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const cupon = cupones.find((c) => c.codigo === codigo);

    if (!cupon) {
      return new Response(JSON.stringify({ error: 'Cupón inválido o no existe' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!cupon.activo) {
      return new Response(JSON.stringify({ error: 'Este cupón está caducado o inactivo' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      discount: cupon.valor, 
      type: cupon.tipo,
      message: '¡Cupón aplicado exitosamente!'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error del servidor procesando el cupón' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
