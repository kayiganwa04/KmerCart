"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import authService from '@/services/auth.service';
import vendorApi, { Product } from '@/services/vendorApi';
import Toast from '@/components/Toast';

export default function VendorProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1, limit: 20 });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'vendor') {
            router.replace('/');
            return;
        }
        fetchProducts();
    }, [router, page, search, statusFilter]);

    async function fetchProducts() {
        try {
            setLoading(true);
            const params: any = { page, limit: 20 };
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;

            const response = await vendorApi.getProducts(params);
            setProducts(response.products);
            setPagination(response.pagination);
        } catch (err: any) {
            console.error('Failed to load products', err);
            setToast(err.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(productId: string) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await vendorApi.deleteProduct(productId);
            setToast('Product deleted successfully');
            fetchProducts();
        } catch (err: any) {
            console.error('Failed to delete product', err);
            setToast(err.response?.data?.message || 'Failed to delete product');
        }
    }

    async function handleToggleActive(product: Product) {
        try {
            await vendorApi.updateProduct(product._id, { isActive: !product.isActive });
            setToast(`Product ${!product.isActive ? 'activated' : 'deactivated'} successfully`);
            fetchProducts();
        } catch (err: any) {
            console.error('Failed to update product', err);
            setToast(err.response?.data?.message || 'Failed to update product');
        }
    }

    function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
        setPage(1);
    }

    function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setStatusFilter(e.target.value);
        setPage(1);
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-allegro-orange">My Products</h1>
                    <p className="text-gray-600 mt-1">Manage your product listings</p>
                </div>
                <Link
                    href="/vendor/products/new"
                    className="bg-allegro-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600 font-medium"
                >
                    Add New Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white border rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <label htmlFor="search" className="block text-sm font-medium mb-1">
                            Search
                        </label>
                        <input
                            id="search"
                            type="text"
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Search by name, SKU, or description..."
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-1">
                            Status
                        </label>
                        <select
                            id="status"
                            value={statusFilter}
                            onChange={handleStatusChange}
                            className="w-full border p-2 rounded focus-ring"
                        >
                            <option value="">All Products</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <p className="text-gray-500">Loading products...</p>
                </div>
            ) : products.length === 0 ? (
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                    <h3 className="text-lg font-semibold mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">
                        {search || statusFilter
                            ? 'Try adjusting your filters'
                            : 'Start by adding your first product'}
                    </p>
                    {!search && !statusFilter && (
                        <Link
                            href="/vendor/products/new"
                            className="inline-flex items-center bg-allegro-orange text-white px-6 py-2 rounded-lg hover:bg-orange-600"
                        >
                            Add Your First Product
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white border rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">SKU</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.mainImage || product.images[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <Link
                                                        href={`/vendor/products/${product._id}`}
                                                        className="font-medium hover:text-allegro-orange"
                                                    >
                                                        {product.name}
                                                    </Link>
                                                    {product.shortDescription && (
                                                        <p className="text-xs text-gray-500 line-clamp-1">
                                                            {product.shortDescription}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{product.sku}</td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <div className="font-medium">${product.price.toFixed(2)}</div>
                                                {product.originalPrice && (
                                                    <div className="text-xs text-gray-500 line-through">
                                                        ${product.originalPrice.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm">
                                                <div className={product.stock === 0 ? 'text-red-600 font-medium' : ''}>
                                                    {product.stock} units
                                                </div>
                                                {product.stock > 0 && product.stock <= product.lowStockThreshold && (
                                                    <div className="text-xs text-yellow-600">Low stock</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        product.isActive
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}
                                                >
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                {product.stock === 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                        Out of Stock
                                                    </span>
                                                )}
                                                {product.isFeatured && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/vendor/products/${product._id}`}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleActive(product)}
                                                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                                                >
                                                    {product.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total products)
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
