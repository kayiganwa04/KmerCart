"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import vendorApi, { Order } from '@/services/vendorApi';
import Toast from '@/components/Toast';

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [toast, setToast] = useState('');
    const [updating, setUpdating] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [statusNote, setStatusNote] = useState('');

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'vendor') {
            router.replace('/');
            return;
        }
        fetchOrder();
    }, [router, orderId]);

    async function fetchOrder() {
        try {
            setLoading(true);
            const data = await vendorApi.getOrder(orderId);
            setOrder(data);
            setTrackingNumber(data.trackingNumber || '');
        } catch (err: any) {
            console.error('Failed to load order', err);
            setToast(err.response?.data?.message || 'Failed to load order');
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateStatus() {
        if (!newStatus) {
            setToast('Please select a status');
            return;
        }

        setUpdating(true);
        try {
            await vendorApi.updateOrderStatus(orderId, {
                status: newStatus,
                trackingNumber: trackingNumber || undefined,
                note: statusNote || undefined,
            });

            setToast('Order status updated successfully');
            setShowStatusModal(false);
            setNewStatus('');
            setStatusNote('');
            fetchOrder();
        } catch (err: any) {
            console.error('Failed to update order status', err);
            setToast(err.response?.data?.message || 'Failed to update order status');
        } finally {
            setUpdating(false);
        }
    }

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'refunded':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Loading order...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    <h3 className="font-semibold mb-2">Order Not Found</h3>
                    <p>The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                    <button
                        onClick={() => router.push('/vendor/orders')}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    const vendorTotal = order.items.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-6">
                <button
                    onClick={() => router.push('/vendor/orders')}
                    className="text-allegro-orange hover:underline mb-2 flex items-center gap-1"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Orders
                </button>
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-allegro-orange">Order #{order.orderNumber}</h1>
                        <p className="text-gray-600 mt-1">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setNewStatus(order.status);
                            setShowStatusModal(true);
                        }}
                        className="bg-allegro-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                    >
                        Update Status
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Status */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
                        <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                            <span className="font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </div>
                        {order.trackingNumber && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600">Tracking Number</p>
                                <p className="text-lg font-mono">{order.trackingNumber}</p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium">{item.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Quantity: {item.quantity}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Price: ${item.price.toFixed(2)} each
                                        </p>
                                        {item.discount > 0 && (
                                            <p className="text-sm text-green-600">
                                                Discount: {item.discount}%
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${item.total.toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Your Total</span>
                                <span className="text-allegro-orange">${vendorTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="bg-white border rounded-lg p-6">
                            <h2 className="text-lg font-semibold mb-4">Status History</h2>
                            <div className="space-y-3">
                                {order.statusHistory.map((history, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className={`w-3 h-3 rounded-full mt-1.5 ${getStatusColor(history.status)}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">
                                                    {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(history.timestamp).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            {history.note && (
                                                <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Customer</h2>
                        <div className="space-y-2 text-sm">
                            <div>
                                <p className="text-gray-600">Name</p>
                                <p className="font-medium">
                                    {order.customerId?.firstName} {order.customerId?.lastName}
                                </p>
                            </div>
                            {order.customerId?.email && (
                                <div>
                                    <p className="text-gray-600">Email</p>
                                    <p className="font-medium">{order.customerId.email}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                        <div className="text-sm space-y-1">
                            <p className="font-medium">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Payment</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                    order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Method</span>
                                <span className="font-medium">{order.paymentMethod}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white border rounded-lg p-6">
                        <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax ({(order.taxRate * 100).toFixed(0)}%)</span>
                                <span>${order.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>${order.shippingCost.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-${order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-base pt-2 border-t">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-semibold mb-4">Update Order Status</h3>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium mb-1">
                                    New Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full border p-2 rounded focus-ring"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="trackingNumber" className="block text-sm font-medium mb-1">
                                    Tracking Number (optional)
                                </label>
                                <input
                                    id="trackingNumber"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    className="w-full border p-2 rounded focus-ring"
                                    placeholder="Enter tracking number"
                                />
                            </div>

                            <div>
                                <label htmlFor="statusNote" className="block text-sm font-medium mb-1">
                                    Note (optional)
                                </label>
                                <textarea
                                    id="statusNote"
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    rows={3}
                                    className="w-full border p-2 rounded focus-ring"
                                    placeholder="Add a note about this status change"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setNewStatus('');
                                    setStatusNote('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                disabled={updating}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-4 py-2 bg-allegro-orange text-white rounded hover:bg-orange-600 disabled:opacity-50"
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toast message={toast} onClose={() => setToast('')} />
        </div>
    );
}
