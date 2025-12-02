"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import authService from '@/services/auth.service';
import vendorApi from '@/services/vendorApi';
import uploadApi from '@/services/uploadApi';
import Toast from '@/components/Toast';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState('');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [mainImageUrl, setMainImageUrl] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        subcategoryId: '',
        price: '',
        originalPrice: '',
        discount: '',
        sku: '',
        stock: '',
        lowStockThreshold: '10',
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
        }
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        try {
            const fileArray = Array.from(files);
            const result = await uploadApi.uploadMultipleImages(fileArray);

            const newImageUrls = result.files.map(f => f.url);
            setUploadedImages(prev => [...prev, ...newImageUrls]);

            // Set first image as main image if not set
            if (!mainImageUrl && newImageUrls.length > 0) {
                setMainImageUrl(newImageUrls[0]);
            }

            setToast(`${files.length} image(s) uploaded successfully`);
        } catch (err: any) {
            console.error('Failed to upload images', err);
            setToast(err.response?.data?.message || 'Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (url: string) => {
        setUploadedImages(prev => prev.filter(img => img !== url));
        if (mainImageUrl === url) {
            setMainImageUrl(uploadedImages.filter(img => img !== url)[0] || '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.description || !formData.price || !formData.sku || !formData.stock) {
            setToast('Please fill in all required fields');
            return;
        }

        // For now, use a default category ID if not selected
        // In production, you would fetch categories and require selection
        const categoryId = formData.categoryId || '000000000000000000000001';

        setLoading(true);
        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                shortDescription: formData.shortDescription || undefined,
                categoryId,
                subcategoryId: formData.subcategoryId || undefined,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                discount: formData.discount ? parseFloat(formData.discount) : undefined,
                sku: formData.sku,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                images: uploadedImages,
                mainImage: mainImageUrl || uploadedImages[0] || undefined,
                tags: formData.tags ? formData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : [],
                isFeatured: formData.isFeatured,
                isActive: formData.isActive,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                seo: {
                    metaTitle: formData.metaTitle || undefined,
                    metaDescription: formData.metaDescription || undefined,
                    keywords: formData.keywords ? formData.keywords.split(',').map((kw: string) => kw.trim()).filter(Boolean) : [],
                },
            };

            await vendorApi.createProduct(productData);
            setToast('Product created successfully!');

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                router.push('/vendor/dashboard');
            }, 1500);
        } catch (err: any) {
            console.error('Failed to create product', err);
            setToast(err.response?.data?.message || 'Failed to create product. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-allegro-orange">Add New Product</h1>
                <p className="text-gray-600 mt-1">Fill in the details below to list a new product</p>
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
                            placeholder="e.g., iPhone 15 Pro Max"
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
                            placeholder="Brief product summary"
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
                            placeholder="Detailed product description..."
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
                                className="w-full border p-2 rounded focus-ring"
                                required
                                placeholder="e.g., IPHONE-15-PRO-256"
                            />
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
                                placeholder="e.g., smartphone, apple, 5g"
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
                                placeholder="99.99"
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
                                placeholder="129.99"
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
                                placeholder="10"
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
                                placeholder="100"
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
                                placeholder="10"
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
                                placeholder="0.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Product Images</h2>

                    <div>
                        <label htmlFor="imageUpload" className="block text-sm font-medium mb-1">
                            Upload Images (Max 10 images, 5MB each)
                        </label>
                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                            multiple
                            onChange={handleImageUpload}
                            className="w-full border p-2 rounded focus-ring"
                            disabled={uploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Accepted formats: JPG, PNG, GIF, WEBP. Max size: 5MB per image.
                        </p>
                    </div>

                    {uploading && (
                        <div className="flex items-center gap-2 text-blue-600">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Uploading images...</span>
                        </div>
                    )}

                    {/* Image Preview Grid */}
                    {uploadedImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {uploadedImages.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={url}
                                        alt={`Product ${index + 1}`}
                                        className={`w-full h-32 object-cover rounded border-2 ${
                                            mainImageUrl === url ? 'border-allegro-orange' : 'border-gray-300'
                                        }`}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded flex items-center justify-center gap-2">
                                        {mainImageUrl !== url && (
                                            <button
                                                type="button"
                                                onClick={() => setMainImageUrl(url)}
                                                className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                            >
                                                Set Main
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(url)}
                                            className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-2 py-1 rounded text-xs"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    {mainImageUrl === url && (
                                        <span className="absolute top-2 right-2 bg-allegro-orange text-white px-2 py-0.5 rounded text-xs font-medium">
                                            Main
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {uploadedImages.length === 0 && (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-12 w-12 mx-auto text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600">No images uploaded yet</p>
                            <p className="text-xs text-gray-500">Use the file input above to upload product images</p>
                        </div>
                    )}
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
                            placeholder="SEO title for search engines"
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
                            placeholder="SEO description for search engines"
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
                            placeholder="keyword1, keyword2, keyword3"
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
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-allegro-orange text-white rounded hover:bg-orange-600 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>

            <Toast message={toast} onClose={() => setToast('')} />
        </div>
    );
}
