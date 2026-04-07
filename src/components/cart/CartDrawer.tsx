import { useStore } from '@nanostores/react';
import { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity } from '../../store/cartStore';

export default function CartDrawer() {
  const isOp = useStore(isCartOpen);
  const items = useStore(cartItems);

  const total = items.reduce((acc, current) => acc + (current.price * current.quantity), 0);
  const formattedTotal = total.toLocaleString('es-CO');

  return (
    <>
      {/* Backdrop overlay */}
      {isOp && (
        <div 
          onClick={toggleCart}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
          }}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside 
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px',
          background: 'rgba(15, 15, 20, 0.95)', backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 9999,
          transform: isOp ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ color: '#fff', fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined">shopping_cart</span>
            Tu Carrito
          </h2>
          <button 
            onClick={toggleCart} 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}
            aria-label="Cerrar carrito"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'rgba(255,255,255,0.5)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>production_quantity_limits</span>
              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.slug} style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <img src={item.image || '/placeholder.png'} alt={item.title} style={{ width: '70px', height: '70px', objectFit: 'contain', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ color: '#fff', margin: 0, fontSize: '0.9rem', lineHeight: 1.2 }}>{item.title}</h4>
                    <button onClick={() => removeFromCart(item.slug)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }}>
                       <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '0.2rem' }}>
                       <button onClick={() => updateQuantity(item.slug, -1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>-</button>
                       <span style={{ color: '#fff', fontSize: '0.85rem', minWidth: '1rem', textAlign: 'center' }}>{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.slug, 1)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>+</button>
                    </div>
                    <span style={{ color: '#cb9bfa', fontWeight: 600, fontSize: '0.9rem' }}>
                      ${(item.price * item.quantity).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', color: '#fff', fontSize: '1.2rem', fontWeight: 600 }}>
              <span>Subtotal:</span>
              <span>${formattedTotal}</span>
            </div>
            <a 
              href="/checkout"
              style={{
                display: 'block', width: '100%', textAlign: 'center',
                background: '#fff', color: '#000', padding: '1rem',
                borderRadius: '8px', textDecoration: 'none', fontWeight: 600,
                transition: 'transform 0.2s'
              }}
              onClick={toggleCart} /* Cierra cajon al ir a pagar */
            >
              Proceder al Pago
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
