import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems } from '../../store/cartStore';

export default function CheckoutForm() {
  const items = useStore(cartItems);
  const [mounted, setMounted] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discountObj, setDiscountObj] = useState<{type: string, value: number} | null>(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  
  let discountAmount = 0;
  if (discountObj) {
    if (discountObj.type === 'porcentaje') {
      discountAmount = subtotal * (discountObj.value / 100);
    } else if (discountObj.type === 'fijo') {
      discountAmount = discountObj.value;
    }
  }
  
  const total = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setDiscountObj(null);
    
    if (!coupon.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon })
      });
      const data = await res.json();
      
      if (!res.ok) {
        setCouponError(data.error);
      } else {
        setDiscountObj({ type: data.type, value: data.discount });
      }
    } catch(err) {
      setCouponError('Error de red al aplicar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Ask Server to sign the transaction securely (PCI DSS v4.0 best practice)
      const res = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Enviamos el cupón directamente para que el backend lo aplique verificando precio en Supabase
        body: JSON.stringify({ items, couponCode: coupon })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      // 2. Open Wompi Widget using the generated signature and reference
      // Wompi requires including a <script> in the DOM or redirecting to their hosted checkout.
      // For this demo, we simulate the redirection.
      
      const WIDGET_URL = `https://checkout.wompi.co/p/?public-key=${data.publicKey}&currency=${data.currency}&amount-in-cents=${data.amountInCents}&reference=${data.reference}&signature:integrity=${data.signature}`;
      
      console.log('Firma SHA-256 válida generada en servidor:', data.signature);
      window.location.href = WIDGET_URL;

    } catch(err) {
      alert('Hubo un problema contactando con el servidor bancario: ' + err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Tu Carrito está Vacío</h2>
        <a href="/colecciones" style={{ color: 'var(--color-brand-primary)' }}>Volver a la tienda</a>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '4rem', maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem' }}>
      
      <div className="checkout-summary" style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: '#fff' }}>Resumen de Compra</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
          {items.map(item => (
            <div key={item.slug} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '8px', background: 'rgba(0,0,0,0.5)' }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{item.title}</h4>
                <p style={{ margin: '0.25rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Cant: {item.quantity}</p>
              </div>
              <div style={{ fontWeight: 600, color: '#fff' }}>
                ${(item.price * item.quantity).toLocaleString('es-CO')}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Código de Descuento" 
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0 1.5rem', borderRadius: '8px', background: 'var(--color-surface-border)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
          >
            Aplicar
          </button>
        </form>
        {couponError && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{couponError}</p>}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.7)' }}>
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString('es-CO')}</span>
          </div>
          {discountObj && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6bff96' }}>
              <span>Descuento aplicado</span>
              <span>- ${discountAmount.toLocaleString('es-CO')}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginTop: '1rem' }}>
            <span>Total a Pagar</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
        </div>
      </div>

      <div className="checkout-details" style={{ padding: '2rem' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', color: '#fff' }}>Datos de Envío</h2>
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Nombre Completo</label>
              <input required type="text" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Correo Electrónico</label>
              <input required type="email" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Dirección de Envío</label>
            <input required type="text" style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
          </div>
          
          <button 
            type="submit" 
            style={{ marginTop: '2rem', padding: '1.25rem', borderRadius: '12px', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1.1rem', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <span className="material-symbols-outlined">lock</span>
            Pagar de Forma Segura con Wompi
          </button>
          
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            Tus datos están protegidos por encriptación SSL y tokenización PCI-DSS.
          </p>
        </form>
      </div>
      
    </div>
  );
}
