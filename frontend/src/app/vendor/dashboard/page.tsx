"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import vendorApi, { DashboardStats, Product as VendorProduct } from '@/services/vendorApi';
import Link from 'next/link';
import Sparkline from '@/components/Sparkline';
import Toast from '@/components/Toast';

export default function VendorDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [products, setProducts] = useState<VendorProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [profileForm, setProfileForm] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<string>('');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'vendor') {
            router.replace('/');
            return;
        }

        setUser(currentUser);
        fetchVendorData();
    }, [router]);

    async function fetchVendorData() {
        try {
            setLoading(true);
            setError('');

            // First, try to get the profile
            const profile = await vendorApi.getProfile();
            setProfileForm(profile.vendorProfile || {});

            // If vendor profile doesn't exist, show profile setup mode
            if (!profile.vendorProfile || !profile.vendorProfile.businessName) {
                setEditing(true);
                setLoading(false);
                setStats({
                    products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
                    orders: { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 },
                    sales: { total: 0, revenue: 0 },
                    recentOrders: [],
                });
                setProducts([]);
                return;
            }

            // If profile exists, fetch dashboard stats and products
            const [dashboardStats, productsResponse] = await Promise.all([
                vendorApi.getDashboardStats().catch(() => ({
                    products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
                    orders: { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 },
                    sales: { total: 0, revenue: 0 },
                    recentOrders: [],
                })),
                vendorApi.getProducts({ page: 1, limit: 10 }).catch(() => ({ products: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } })),
            ]);

            setStats(dashboardStats);
            setProducts(productsResponse.products);
        } catch (err: any) {
            console.error('Failed to load vendor data', err);

            // If it's a profile not found error, enable profile editing
            if (err.response?.status === 403 && err.response?.data?.message?.includes('profile not found')) {
                setEditing(true);
                setProfileForm({ businessName: '', taxId: '' });
                setStats({
                    products: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
                    orders: { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 },
                    sales: { total: 0, revenue: 0 },
                    recentOrders: [],
                });
                setProducts([]);
            } else {
                setError(err.response?.data?.message || 'Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    }

    async function saveProfile() {
        if (!profileForm?.businessName || !profileForm?.taxId) {
            setToast('Please provide business name and tax ID');
            return;
        }

        setSaving(true);
        try {
            await vendorApi.updateProfile(profileForm);

            // Refresh profile data
            const updatedProfile = await vendorApi.getProfile();
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                currentUser.vendorProfile = updatedProfile.vendorProfile;
                localStorage.setItem('user', JSON.stringify(currentUser));
                window.dispatchEvent(new CustomEvent('authChanged', { detail: { user: currentUser } }));
                setUser(currentUser);
            }

            setEditing(false);
            setToast('Profile updated successfully');
        } catch (err: any) {
            console.error('Failed to save profile', err);
            setToast(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
                    <p>{error}</p>
                    <button
                        onClick={fetchVendorData}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Welcome Banner for new vendors */}
            {editing && (!profileForm?.businessName || !profileForm?.taxId) && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">Welcome to KmerCart Vendor Portal!</h2>
                    <p className="text-blue-800 mb-4">
                        Complete your vendor profile below to start selling on our platform. Once approved by our team, you'll be able to list products and manage orders.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>After saving your profile, it will be reviewed by our admin team within 24-48 hours.</span>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-allegro-orange">Vendor Dashboard</h1>
                    <p className="text-gray-600 mt-1">
                        {profileForm?.businessName ? `Welcome back, ${user.firstName} ${user.lastName}.` : `Hello, ${user.firstName} ${user.lastName}! Let's set up your vendor profile.`}
                    </p>
                </div>
                <div className="flex gap-3">
                    {profileForm?.businessName && profileForm?.isApproved && (
                        <>
                            <Link
                                href="/vendor/products"
                                className="bg-white border border-allegro-orange text-allegro-orange px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-orange-50"
                            >
                                Manage Products
                            </Link>
                            <Link
                                href="/vendor/orders"
                                className="bg-white border border-allegro-orange text-allegro-orange px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-orange-50"
                            >
                                View Orders
                            </Link>
                        </>
                    )}
                    <button
                        onClick={() => { setEditing((s) => !s); }}
                        className="bg-white border border-allegro-orange text-allegro-orange px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-orange-50"
                    >
                        {editing ? 'Cancel' : (profileForm?.businessName ? 'Edit Profile' : 'Setup Profile')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="mt-8 flex items-center justify-center">
                    <p className="text-gray-500">Loading dashboard data...</p>
                </div>
            ) : (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="stat-card focus-ring" tabIndex={0} role="group" aria-label="Products">
                                <div className="flex items-center justify-between">
                                    <div className="stat-label">Products</div>
                                    <div aria-hidden>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-allegro-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-value mt-3">{stats?.products.total || 0}</div>
                                <div className="text-xs text-gray-400 mt-1">{stats?.products.active || 0} active</div>
                            </div>

                            <div className="stat-card focus-ring" tabIndex={0} role="group" aria-label="Orders">
                                <div className="flex items-center justify-between">
                                    <div className="stat-label">Orders</div>
                                    <div aria-hidden>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-allegro-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-value mt-3">{stats?.orders.total || 0}</div>
                                <div className="text-xs text-gray-400 mt-1">{stats?.orders.pending || 0} pending</div>
                            </div>

                            <div className="stat-card focus-ring" tabIndex={0} role="group" aria-label="Total sales">
                                <div className="flex items-center justify-between">
                                    <div className="stat-label">Total Sales</div>
                                    <div aria-hidden>
                                        <Sparkline data={[10, 20, 8, 25, 40, Math.max(0, stats?.sales.total || 0)]} width={80} height={28} />
                                    </div>
                                </div>
                                <div className="stat-value mt-3">${(stats?.sales.total || 0).toFixed(2)}</div>
                                <div className="text-xs text-gray-400 mt-1">{stats?.orders.delivered || 0} delivered</div>
                            </div>

                            <div className="stat-card focus-ring" tabIndex={0} role="group" aria-label="Low stock">
                                <div className="flex items-center justify-between">
                                    <div className="stat-label">Low Stock</div>
                                    <div aria-hidden>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="stat-value mt-3">{stats?.products.lowStock || 0}</div>
                                <div className="text-xs text-gray-400 mt-1">{stats?.products.outOfStock || 0} out of stock</div>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold">Your Products</h2>
                                <Link
                                    href="/vendor/products/new"
                                    className="text-sm bg-allegro-orange text-white px-3 py-1.5 rounded hover:bg-orange-600"
                                >
                                    Add Product
                                </Link>
                            </div>
                            {products.length === 0 ? (
                                <div className="empty-state">
                                    <div aria-hidden>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">No products yet</div>
                                        <div className="text-sm text-gray-500">List your first product to start selling.</div>
                                        <div className="mt-2">
                                            <Link href="/vendor/products/new" className="inline-flex items-center px-3 py-2 bg-allegro-orange text-white rounded focus-ring">Add product</Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {products.map((p) => (
                                        <Link
                                            key={p._id}
                                            href={`/vendor/products/${p._id}`}
                                            className="flex items-center space-x-3 p-3 border rounded hover:shadow-sm transition-shadow focus-ring"
                                            tabIndex={0}
                                        >
                                            <img
                                                src={p.mainImage || p.images[0] || '/placeholder.png'}
                                                alt={p.name}
                                                className="h-14 w-14 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-sm text-gray-500">${p.price.toFixed(2)}</div>
                                                <div className="text-xs text-gray-400">Stock: {p.stock}</div>
                                            </div>
                                            {!p.isActive && (
                                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inactive</span>
                                            )}
                                            {p.stock <= p.lowStockThreshold && p.stock > 0 && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Low Stock</span>
                                            )}
                                            {p.stock === 0 && (
                                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Out of Stock</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Orders */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-semibold">Recent Orders</h2>
                                <Link
                                    href="/vendor/orders"
                                    className="text-sm text-allegro-orange hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                                <div className="empty-state">
                                    <div aria-hidden>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-medium">No orders yet</div>
                                        <div className="text-sm text-gray-500">Orders will appear here when customers buy your products.</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {stats.recentOrders.map((order) => (
                                        <Link
                                            key={order._id}
                                            href={`/vendor/orders/${order._id}`}
                                            className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium">Order #{order.orderNumber}</div>
                                                <div className="text-sm text-gray-500">
                                                    {order.items.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">${order.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</div>
                                                <div className={`text-sm ${
                                                    order.status === 'delivered' ? 'text-green-600' :
                                                    order.status === 'cancelled' ? 'text-red-600' :
                                                    'text-yellow-600'
                                                }`}>
                                                    {order.status}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="space-y-6">
                        <div className="p-4 bg-white rounded-lg shadow">
                            <h3 className="font-semibold">Vendor Profile</h3>
                            {profileForm ? (
                                <div className="mt-3 text-sm text-gray-700 space-y-1">
                                    <div><strong>Business:</strong> {profileForm.businessName}</div>
                                    {profileForm.taxId && <div><strong>Tax ID:</strong> {profileForm.taxId}</div>}
                                    <div>
                                        <strong>Status:</strong>{' '}
                                        <span className={profileForm.isApproved ? 'text-green-600' : 'text-yellow-600'}>
                                            {profileForm.isApproved ? 'Approved' : 'Pending Approval'}
                                        </span>
                                    </div>
                                    {profileForm.rating && (
                                        <div><strong>Rating:</strong> {profileForm.rating.toFixed(1)} / 5.0</div>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-gray-500">No vendor profile yet.</p>
                            )}
                        </div>

                        {editing && (
                            <div className="p-4 bg-white rounded-lg shadow">
                                <h4 className="font-semibold mb-2">Edit Vendor Profile</h4>
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <label className="block text-gray-700 mb-1" htmlFor="businessName">Business Name *</label>
                                        <input
                                            id="businessName"
                                            required
                                            value={profileForm?.businessName || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, businessName: e.target.value })}
                                            className="w-full border p-2 rounded focus-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-1" htmlFor="businessDescription">Description</label>
                                        <textarea
                                            id="businessDescription"
                                            rows={3}
                                            value={profileForm?.businessDescription || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, businessDescription: e.target.value })}
                                            className="w-full border p-2 rounded focus-ring"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 mb-1" htmlFor="taxId">Tax ID *</label>
                                        <input
                                            id="taxId"
                                            required
                                            value={profileForm?.taxId || ''}
                                            onChange={(e) => setProfileForm({ ...profileForm, taxId: e.target.value })}
                                            className="w-full border p-2 rounded focus-ring"
                                        />
                                    </div>

                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="mt-2 w-full bg-allegro-orange text-white py-2 rounded hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="p-4 bg-white rounded-lg shadow">
                            <h3 className="font-semibold mb-3">Order Status</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Pending</span>
                                    <span className="font-medium">{stats?.orders.pending || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Processing</span>
                                    <span className="font-medium">{stats?.orders.processing || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipped</span>
                                    <span className="font-medium">{stats?.orders.shipped || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Delivered</span>
                                    <span className="font-medium text-green-600">{stats?.orders.delivered || 0}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
            <Toast message={toast} onClose={() => setToast('')} />
        </div>
    );
}
