"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import vendorApi, { Order } from '@/services/vendorApi';
import Toast from '@/components/Toast';

export default function VendorOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1, limit: 20 });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'vendor') {
            router.replace('/');
            return;
        }
        fetchOrders();
    }, [router, page, statusFilter]);

    async function fetchOrders() {
        try {
            setLoading(true);
            const params: any = { page, limit: 20 };
            if (statusFilter) params.status = statusFilter;

            const response = await vendorApi.getOrders(params);
            setOrders(response.orders);
            setPagination(response.pagination);
        } catch (err: any) {
            console.error('Failed to load orders', err);
            setToast(err.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    }

    function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setStatusFilter(e.target.value);
        setPage(1);
    }

    function getStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    function getPaymentStatusColor(status: string) {
        switch (status.toLowerCase()) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-allegro-orange">My Orders</h1>
                <p className="text-gray-600 mt-1">Manage and track customer orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">
                            Order Status
                        </label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="w-full border p-2 rounded focus-ring"
                        >
                            <option value="">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="refunded">Refunded</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-500">Loading orders...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white border rounded-lg p-12 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-16 w-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-gray-600">
                        {statusFilter ? 'Try adjusting your filters' : 'Orders will appear here when customers buy your products'}
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const vendorTotal = order.items.reduce((sum, item) => sum + item.total, 0);

                            return (
                                <div key={order._id} className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <Link
                                                    href={`/vendor/orders/${order._id}`}
                                                    className="text-lg font-semibold text-allegro-orange hover:underline"
                                                >
                                                    Order #{order.orderNumber}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    Payment: {order.paymentStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="mb-4 pb-4 border-b">
                                            <h4 className="text-sm font-medium text-gray-700 mb-1">Customer</h4>
                                            <p className="text-sm text-gray-600">
                                                {order.customerId?.firstName} {order.customerId?.lastName}
                                            </p>
                                            {order.customerId?.email && (
                                                <p className="text-sm text-gray-500">{order.customerId.email}</p>
                                            )}
                                        </div>

                                        {/* Order Items */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Items</h4>
                                            <div className="space-y-2">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                                                        {item.image && (
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">{item.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="text-sm font-medium">${item.total.toFixed(2)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="text-sm text-gray-600">
                                                {order.trackingNumber && (
                                                    <p>
                                                        <span className="font-medium">Tracking:</span> {order.trackingNumber}
                                                    </p>
                                                )}
                                                <p>
                                                    <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Your Total</p>
                                                    <p className="text-lg font-bold text-allegro-orange">${vendorTotal.toFixed(2)}</p>
                                                </div>
                                                <Link
                                                    href={`/vendor/orders/${order._id}`}
                                                    className="bg-allegro-orange text-white px-4 py-2 rounded hover:bg-orange-600"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            <Toast message={toast} onClose={() => setToast('')} />
        </div>
    );
}
