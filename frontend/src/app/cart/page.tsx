'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import authService from '@/services/auth.service';
import cartApi, { Cart } from '@/services/cartApi';
import Toast from '@/components/Toast';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const router = useRouter();
  const localItems = useCartStore((s) => s.items);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();

    // If there's no authenticated user, fall back to local (guest) cart
    if (!user) {
      if (localItems && localItems.length > 0) {
        const mapped: Cart = {
          _id: 'local',
          userId: 'guest',
          items: localItems.map((li) => ({
            productId: {
              _id: li.product.id,
              name: li.product.title || (li.product as any).name || 'Product',
              price: li.product.price || li.product.originalPrice || 0,
              mainImage: li.product.image || (li.product.images && li.product.images[0]) || '',
              images: li.product.images || [],
              stock: typeof li.product.inStock === 'boolean' ? (li.product.inStock ? 9999 : 0) : (li.product as any).stock || 0,
              isActive: true,
            },
            quantity: li.quantity,
            price: li.product.price || li.product.originalPrice || 0,
            addedAt: new Date(),
          })),
          updatedAt: new Date(),
        };

        setCart(mapped);
      }

      setLoading(false);
      return;
    }

    fetchCart();
  }, [router, localItems]);

  async function fetchCart() {
    try {
      setLoading(true);
      const cartData = await cartApi.getCart();

      // If backend cart is empty but local guest cart exists, use the local cart as fallback
      if ((!cartData || !cartData.items || cartData.items.length === 0) && localItems && localItems.length > 0) {
        const mapped: Cart = {
          _id: 'local',
          userId: authService.getCurrentUser()?._id || 'guest',
          items: localItems.map((li) => ({
            productId: {
              _id: li.product.id,
              name: li.product.title || (li.product as any).name || 'Product',
              price: li.product.price || li.product.originalPrice || 0,
              mainImage: li.product.image || (li.product.images && li.product.images[0]) || '',
              images: li.product.images || [],
              stock: typeof li.product.inStock === 'boolean' ? (li.product.inStock ? 9999 : 0) : (li.product as any).stock || 0,
              isActive: true,
            },
            quantity: li.quantity,
            price: li.product.price || li.product.originalPrice || 0,
            addedAt: new Date(),
          })),
          updatedAt: new Date(),
        };

        setCart(mapped);
      } else {
        setCart(cartData);
      }
    } catch (error: any) {
      console.error('Failed to fetch cart', error);
      setToast(error.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId: string, newQuantity: number) {
    if (newQuantity < 1) return;

    const item = cart?.items.find(i => i.productId._id === productId);
    if (!item) return;

    if (newQuantity > item.productId.stock) {
      setToast(`Only ${item.productId.stock} items available in stock`);
      return;
    }

    try {
      setUpdating(productId);

      if (authService.isAuthenticated()) {
        const updatedCart = await cartApi.updateItemQuantity(productId, newQuantity);
        setCart(updatedCart);
      } else {
        // Guest: update local zustand store
        await useCartStore.getState().updateQuantity(productId, newQuantity);
        // update local cart state from store
        const local = useCartStore.getState().items;
        const mapped: any = {
          _id: 'local',
          userId: 'guest',
          items: local.map((li) => ({
            productId: {
              _id: (li.product as any).id,
              name: li.product.title || (li.product as any).name || 'Product',
              price: li.product.price || li.product.originalPrice || 0,
              mainImage: li.product.image || (li.product.images && li.product.images[0]) || '',
              images: li.product.images || [],
              stock: typeof li.product.inStock === 'boolean' ? (li.product.inStock ? 9999 : 0) : (li.product as any).stock || 0,
              isActive: true,
            },
            quantity: li.quantity,
            price: li.product.price || li.product.originalPrice || 0,
            addedAt: new Date(),
          })),
          updatedAt: new Date(),
        };

        setCart(mapped);
      }

      setToast('Cart updated');
    } catch (error: any) {
      console.error('Failed to update quantity', error);
      setToast(error.response?.data?.message || 'Failed to update cart');
    } finally {
      setUpdating(null);
    }
  }

  async function removeItem(productId: string) {
    try {
      setUpdating(productId);

      if (authService.isAuthenticated()) {
        const updatedCart = await cartApi.removeItem(productId);
        setCart(updatedCart);
      } else {
        await useCartStore.getState().removeItem(productId);
        const local = useCartStore.getState().items;
        const mapped: any = {
          _id: 'local',
          userId: 'guest',
          items: local.map((li) => ({
            productId: {
              _id: (li.product as any).id,
              name: li.product.title || (li.product as any).name || 'Product',
              price: li.product.price || li.product.originalPrice || 0,
              mainImage: li.product.image || (li.product.images && li.product.images[0]) || '',
              images: li.product.images || [],
              stock: typeof li.product.inStock === 'boolean' ? (li.product.inStock ? 9999 : 0) : (li.product as any).stock || 0,
              isActive: true,
            },
            quantity: li.quantity,
            price: li.product.price || li.product.originalPrice || 0,
            addedAt: new Date(),
          })),
          updatedAt: new Date(),
        };

        setCart(mapped);
      }

      setToast('Item removed from cart');
    } catch (error: any) {
      console.error('Failed to remove item', error);
      setToast(error.response?.data?.message || 'Failed to remove item');
      setUpdating(null);
    }
  }

  async function clearAllCart() {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;

    try {
      setLoading(true);
      if (authService.isAuthenticated()) {
        await cartApi.clearCart();
      } else {
        useCartStore.getState().clearCart();
      }
      setCart({ ...cart!, items: [] });
      setToast('Cart cleared');
    } catch (error: any) {
      console.error('Failed to clear cart', error);
      setToast(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  }

  const calculateTotals = () => {
    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0 };
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08;
    const shipping = 5;
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="text-6xl mb-4">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link
              href="/"
              className="inline-block bg-allegro-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          {cart.items.length > 0 && (
            <button
              onClick={clearAllCart}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Clear Cart
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.div
                  key={item.productId._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-white rounded-lg shadow p-6"
                >
                  <div className="flex gap-6">
                    <Link href={`/product/${item.productId._id}`}>
                      <img
                        src={item.productId.mainImage || item.productId.images[0] || '/placeholder.png'}
                        alt={item.productId.name}
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    </Link>

                    <div className="flex-1">
                      <Link
                        href={`/product/${item.productId._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-allegro-orange transition-colors"
                      >
                        {item.productId.name}
                      </Link>

                      <p className="text-sm text-gray-500 mt-1">
                        {item.productId.stock > 0 ? (
                          <span className="text-green-600">In Stock ({item.productId.stock} available)</span>
                        ) : (
                          <span className="text-red-600">Out of Stock</span>
                        )}
                      </p>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                            disabled={updating === item.productId._id || item.quantity <= 1}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <span className="text-lg font-medium w-12 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
                            disabled={updating === item.productId._id || item.quantity >= item.productId.stock}
                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId._id)}
                        disabled={updating === item.productId._id}
                        className="mt-4 text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                      >
                        {updating === item.productId._id ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6 sticky top-4"
            >
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (8%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-allegro-orange">${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-allegro-orange text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors mb-3"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
