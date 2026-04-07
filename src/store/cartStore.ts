import { atom } from 'nanostores';
import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  slug: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  sku: string;
}

export const cartItems = persistentAtom<CartItem[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const isCartOpen = atom<boolean>(false);

export function addToCart(item: CartItem) {
  const current = cartItems.get();
  const existing = current.find(i => i.slug === item.slug);
  
  if (existing) {
    cartItems.set(current.map(i => i.slug === item.slug ? { ...i, quantity: i.quantity + item.quantity } : i));
  } else {
    cartItems.set([...current, item]);
  }
  
  isCartOpen.set(true); // Open drawer visually when item is added
}

export function updateQuantity(slug: string, delta: number) {
  const current = cartItems.get();
  const existing = current.find(i => i.slug === slug);
  if (!existing) return;
  
  const newQty = existing.quantity + delta;
  if (newQty <= 0) {
    removeFromCart(slug);
  } else {
    cartItems.set(current.map(i => i.slug === slug ? { ...i, quantity: newQty } : i));
  }
}

export function removeFromCart(slug: string) {
  cartItems.set(cartItems.get().filter(i => i.slug !== slug));
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}
