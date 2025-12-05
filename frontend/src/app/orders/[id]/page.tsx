'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import authService from '@/services/auth.service';
import ordersApi, { Order } from '@/services/ordersApi';
import Toast from '@/components/Toast';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/login?redirect=/orders');
      return;
    }

    // Show success message if redirected from checkout
    if (searchParams.get('success') === 'true') {
      setToast('Order placed successfully! 🎉');
    }

    fetchOrder();
  }, [router, orderId, searchParams]);

  const normalizeImage = (url?: string) => {
    if (!url) return '/placeholder.png';
    if (url.startsWith('http')) return url;
    const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  };

  async function fetchOrder() {
    try {
      setLoading(true);
      const orderData = await ordersApi.getOrder(orderId);
      setOrder(orderData);
    } catch (error: any) {
      console.error('Failed to fetch order', error);
      // If unauthorized, show clearer message
      if (error.response?.status === 401) {
        setToast('You are not authorized to view this order. Please login again.');
        setLoading(false);
        return;
      }

      // Try sessionStorage fallback for recently created order or any cached order entries
      try {
        // direct key first
        const rawDirect = sessionStorage.getItem(`order:${orderId}`);
        if (rawDirect) {
          setOrder(JSON.parse(rawDirect));
          setToast('Showing recently created order (offline copy)');
          return;
        }

        // scan for any session keys that look like order:<id> and match by _id or orderNumber
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i) || '';
          if (!key.startsWith('order:')) continue;
          try {
            const candidate = JSON.parse(sessionStorage.getItem(key) || 'null');
            if (!candidate) continue;
            if (candidate._id === orderId || candidate.orderNumber === orderId) {
              setOrder(candidate);
              setToast('Showing recently created order (offline copy)');
              return;
            }
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (e) {
        // ignore
      }

      // As a last resort, try fetching the user's orders list and locate the order there
      try {
        const listResp = await ordersApi.getOrders({ page: 1, limit: 100 });
        const found = (listResp.orders || []).find((o: any) => o._id === orderId || o.orderNumber === orderId);
        if (found) {
          setOrder(found);
          setToast('Showing order from orders list (fallback)');
          return;
        }
      } catch (e) {
        // ignore list fetch errors
        console.error('Failed to fetch orders list fallback', e);
      }

      setToast(error.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancelling(true);
      const updatedOrder = await ordersApi.cancelOrder(orderId, 'Cancelled by customer');
      setOrder(updatedOrder);
      setToast('Order cancelled successfully');
    } catch (error: any) {
      console.error('Failed to cancel order', error);
      setToast(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-8">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <Link
            href="/orders"
            className="inline-block bg-allegro-orange text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/orders"
          className="inline-flex items-center text-allegro-orange hover:text-orange-600 mb-6"
        >
          ← Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status]
                  }`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${paymentStatusColors[order.paymentStatus]
                  }`}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={
                        item.productId?.mainImage ||
                        item.productId?.images?.[0] ||
                        '/placeholder.png'
                      }
                      alt={item.productId?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.productId?.name || 'Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Order Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.statusHistory?.map((history, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-allegro-orange' : 'bg-gray-300'
                          }`}
                      />
                      {index < order.statusHistory.length - 1 && (
                        <div className="w-0.5 h-12 bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-semibold text-gray-900 capitalize">
                        {history.status}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(history.timestamp)}
                      </p>
                      {history.note && (
                        <p className="text-sm text-gray-500 mt-1">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(order.taxRate * 100).toFixed(0)}%)</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>${order.shippingCost.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-allegro-orange">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
              <div className="text-gray-700 space-y-1">
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="pt-2">{order.shippingAddress.phone}</p>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <p className="text-gray-700 capitalize">
                {order.paymentMethod.replace('_', ' ')}
              </p>
            </motion.div>

            {/* Tracking Number */}
            {order.trackingNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Tracking Number</h2>
                <p className="text-gray-700 font-mono">{order.trackingNumber}</p>
              </motion.div>
            )}

            {/* Actions */}
            {canCancel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}
