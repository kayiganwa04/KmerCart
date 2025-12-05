'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import authService from '@/services/auth.service';
import cartApi, { Cart } from '@/services/cartApi';
import ordersApi, { ShippingAddress } from '@/services/ordersApi';
import Toast from '@/components/Toast';
import { useCartStore } from '@/store/cartStore';

export default function CheckoutPage() {
  const router = useRouter();
  const localItems = useCartStore((s) => s.items);
  const [user, setUser] = useState<any>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState('');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Rwanda',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [sameAsBilling, setSameAsBilling] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login?redirect=/checkout');
      return;
    }

    setUser(currentUser);
    // Pre-fill with user data
    setShippingAddress(prev => ({
      ...prev,
      fullName: `${currentUser.firstName} ${currentUser.lastName}`,
      phone: currentUser.phone || '',
    }));

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
              _id: (li.product as any).id || (li.product as any)._id || String((li.product as any).id || ''),
              name: (li.product as any).title || (li.product as any).name || 'Product',
              price: (li.product as any).price || (li.product as any).originalPrice || 0,
              mainImage: (li.product as any).image || ((li.product as any).images && (li.product as any).images[0]) || '',
              images: (li.product as any).images || [],
              stock: typeof (li.product as any).inStock === 'boolean' ? ((li.product as any).inStock ? 9999 : 0) : (li.product as any).stock || 0,
              isActive: true,
            },
            quantity: li.quantity,
            price: (li.product as any).price || (li.product as any).originalPrice || 0,
            addedAt: new Date(),
          })),
          updatedAt: new Date(),
        };

        setCart(mapped);
      } else {
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          setToast('Your cart is empty');
          setTimeout(() => router.push('/'), 2000);
          return;
        }
        setCart(cartData);
      }
    } catch (error: any) {
      console.error('Failed to fetch cart', error);
      setToast(error.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }

  const calculateTotals = () => {
    if (!cart) return { subtotal: 0, tax: 0, shipping: 0, total: 0 };

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.08; // 8% tax
    const shipping = 5; // Flat rate shipping
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city ||
      !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.phone) {
      setToast('Please fill in all shipping address fields');
      return;
    }

    try {
      setPlacing(true);

      const orderData = {
        paymentMethod,
        shippingAddress,
        billingAddress: sameAsBilling ? shippingAddress : undefined,
        shippingCost: calculateTotals().shipping,
        discount: 0,
      };

      const order = await ordersApi.createOrder(orderData);

      // Store a session fallback for the created order so the details page can show it
      try {
        sessionStorage.setItem(`order:${order._id}`, JSON.stringify(order));
      } catch (e) {
        // ignore
      }

      // Clear server cart and local guest cart after successful order
      try {
        // Clear server cart
        await cartApi.clearCart();
      } catch (e) {
        console.error('Failed to clear server cart after order', e);
      }

      try {
        // Clear local guest cart
        const { clearCart } = (await import('@/store/cartStore')).useCartStore.getState();
        if (typeof clearCart === 'function') clearCart();
      } catch (e) {
        try { localStorage.removeItem('cart-storage'); } catch (e) { /* ignore */ }
      }

      // Redirect to order confirmation (detail page). If GET fails the detail page will use session fallback.
      router.push(`/orders/${order._id}?success=true`);
    } catch (error: any) {
      console.error('Failed to place order', error);
      setToast(error.response?.data?.message || 'Failed to place order');
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading checkout...</p>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, fullName: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.street}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, street: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP/Postal Code *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.zipCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, phone: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-allegro-orange focus:border-transparent"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash_on_delivery"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when you receive your order</div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">Bank Transfer</div>
                    <div className="text-sm text-gray-500">Transfer payment to our bank account</div>
                  </div>
                </label>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6 sticky top-4"
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart?.items.map((item) => (
                  <div key={item.productId._id} className="flex items-center gap-3">
                    <img
                      src={item.productId.mainImage || item.productId.images[0] || '/placeholder.png'}
                      alt={item.productId.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productId.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (8%)</span>
                  <span>${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t pt-2">
                  <span>Total</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full mt-6 bg-allegro-orange text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing Order...' : 'Place Order'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By placing your order, you agree to our terms and conditions
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
