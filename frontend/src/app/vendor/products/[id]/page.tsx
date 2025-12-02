"use client";

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import vendorApi, { Product } from '@/services/vendorApi';
import Toast from '@/components/Toast';

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState('');
    const [product, setProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: '',
        originalPrice: '',
        discount: '',
        sku: '',
        stock: '',
        lowStockThreshold: '',
        images: '',
        mainImage: '',
        tags: '',
        isFeatured: false,
        isActive: true,
        weight: '',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
    });

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || user.role !== 'vendor') {
            router.replace('/');
            return;
        }
        fetchProduct();
    }, [router, productId]);

    async function fetchProduct() {
        try {
            setLoading(true);
            const data = await vendorApi.getProduct(productId);
            setProduct(data);

            // Populate form
            setFormData({
                name: data.name,
                description: data.description,
                shortDescription: data.shortDescription || '',
                price: data.price.toString(),
                originalPrice: data.originalPrice?.toString() || '',
                discount: data.discount?.toString() || '',
                sku: data.sku,
                stock: data.stock.toString(),
                lowStockThreshold: data.lowStockThreshold.toString(),
                images: data.images.join(', '),
                mainImage: data.mainImage || '',
                tags: data.tags.join(', '),
                isFeatured: data.isFeatured,
                isActive: data.isActive,
                weight: data.weight?.toString() || '',
                metaTitle: data.seo?.metaTitle || '',
                metaDescription: data.seo?.metaDescription || '',
                keywords: data.seo?.keywords?.join(', ') || '',
            });
        } catch (err: any) {
            console.error('Failed to load product', err);
            setToast(err.response?.data?.message || 'Failed to load product');
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description || !formData.price || !formData.sku || !formData.stock) {
            setToast('Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const productData: any = {
                name: formData.name,
                description: formData.description,
                shortDescription: formData.shortDescription || undefined,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                discount: formData.discount ? parseFloat(formData.discount) : undefined,
                sku: formData.sku,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                images: formData.images ? formData.images.split(',').map(img => img.trim()).filter(Boolean) : [],
                mainImage: formData.mainImage || undefined,
                tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
                isFeatured: formData.isFeatured,
                isActive: formData.isActive,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                seo: {
                    metaTitle: formData.metaTitle || undefined,
                    metaDescription: formData.metaDescription || undefined,
                    keywords: formData.keywords ? formData.keywords.split(',').map(kw => kw.trim()).filter(Boolean) : [],
                },
            };

            await vendorApi.updateProduct(productId, productData);
            setToast('Product updated successfully!');

            setTimeout(() => {
                router.push('/vendor/products');
            }, 1500);
        } catch (err: any) {
            console.error('Failed to update product', err);
            setToast(err.response?.data?.message || 'Failed to update product. Please try again.');
            setSaving(false);
        }
    };

    async function handleUpdateStock() {
        const newStock = prompt('Enter new stock quantity:', formData.stock);
        if (newStock === null) return;

        const stockNum = parseInt(newStock);
        if (isNaN(stockNum) || stockNum < 0) {
            setToast('Invalid stock quantity');
            return;
        }

        try {
            await vendorApi.updateProductStock(productId, stockNum);
            setFormData(prev => ({ ...prev, stock: stockNum.toString() }));
            setToast('Stock updated successfully');
        } catch (err: any) {
            console.error('Failed to update stock', err);
            setToast(err.response?.data?.message || 'Failed to update stock');
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    <h3 className="font-semibold mb-2">Product Not Found</h3>
                    <p>The product you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => router.push('/vendor/products')}
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-allegro-orange">Edit Product</h1>
                    <p className="text-gray-600 mt-1">Update product details</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleUpdateStock}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Quick Stock Update
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-lg p-6 shadow-sm">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>

                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Product Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus-ring"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="shortDescription" className="block text-sm font-medium mb-1">
                            Short Description
                        </label>
                        <input
                            id="shortDescription"
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium mb-1">
                            Full Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={5}
                            className="w-full border p-2 rounded focus-ring"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="sku" className="block text-sm font-medium mb-1">
                                SKU <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="sku"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring bg-gray-50"
                                required
                                disabled
                            />
                            <p className="text-xs text-gray-500 mt-1">SKU cannot be changed</p>
                        </div>

                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium mb-1">
                                Tags (comma-separated)
                            </label>
                            <input
                                id="tags"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Pricing</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium mb-1">
                                Price (USD) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="originalPrice" className="block text-sm font-medium mb-1">
                                Original Price (USD)
                            </label>
                            <input
                                id="originalPrice"
                                name="originalPrice"
                                type="number"
                                step="0.01"
                                value={formData.originalPrice}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                            />
                        </div>

                        <div>
                            <label htmlFor="discount" className="block text-sm font-medium mb-1">
                                Discount (%)
                            </label>
                            <input
                                id="discount"
                                name="discount"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={formData.discount}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Inventory */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Inventory</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="stock" className="block text-sm font-medium mb-1">
                                Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="lowStockThreshold" className="block text-sm font-medium mb-1">
                                Low Stock Alert
                            </label>
                            <input
                                id="lowStockThreshold"
                                name="lowStockThreshold"
                                type="number"
                                value={formData.lowStockThreshold}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                            />
                        </div>

                        <div>
                            <label htmlFor="weight" className="block text-sm font-medium mb-1">
                                Weight (kg)
                            </label>
                            <input
                                id="weight"
                                name="weight"
                                type="number"
                                step="0.01"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Images</h2>

                    <div>
                        <label htmlFor="mainImage" className="block text-sm font-medium mb-1">
                            Main Image URL
                        </label>
                        <input
                            id="mainImage"
                            name="mainImage"
                            value={formData.mainImage}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor="images" className="block text-sm font-medium mb-1">
                            Additional Images (comma-separated URLs)
                        </label>
                        <textarea
                            id="images"
                            name="images"
                            value={formData.images}
                            onChange={handleChange}
                            rows={3}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">SEO (Optional)</h2>

                    <div>
                        <label htmlFor="metaTitle" className="block text-sm font-medium mb-1">
                            Meta Title
                        </label>
                        <input
                            id="metaTitle"
                            name="metaTitle"
                            value={formData.metaTitle}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor="metaDescription" className="block text-sm font-medium mb-1">
                            Meta Description
                        </label>
                        <textarea
                            id="metaDescription"
                            name="metaDescription"
                            value={formData.metaDescription}
                            onChange={handleChange}
                            rows={2}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor="keywords" className="block text-sm font-medium mb-1">
                            Keywords (comma-separated)
                        </label>
                        <input
                            id="keywords"
                            name="keywords"
                            value={formData.keywords}
                            onChange={handleChange}
                            className="w-full border p-2 rounded focus-ring"
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Status</h2>

                    <div className="flex items-center gap-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm">Active (visible to customers)</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <span className="text-sm">Featured Product</span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => router.push('/vendor/products')}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={saving}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-allegro-orange text-white rounded hover:bg-orange-600 disabled:opacity-50"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <Toast message={toast} onClose={() => setToast('')} />
        </div>
    );
}
