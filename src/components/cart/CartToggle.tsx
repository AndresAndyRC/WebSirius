import { useStore } from '@nanostores/react';
import { cartItems, toggleCart } from '../../store/cartStore';

export default function CartToggle() {
  const items = useStore(cartItems);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <button 
      onClick={toggleCart}
      style={{
        background: 'transparent',
        border: 'none',
        color: 'var(--color-text-secondary)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.5rem',
        position: 'relative',
        transition: 'color 0.2s'
      }}
      aria-label={`Ver carrito (${itemCount} artículos)`}
      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-text-primary)'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-secondary)'}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1.4rem' }}>shopping_cart</span>
      {itemCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '0',
          right: '0',
          background: 'var(--color-brand-primary)',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 700,
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(10,10,14,0.85)'
        }}>
          {itemCount}
        </span>
      )}
    </button>
  );
}
