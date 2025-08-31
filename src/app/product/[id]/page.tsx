'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Star, ShoppingCart, Heart, Truck, Shield, RotateCcw } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/ProductCard';
import products from '@/data/products.json';
import { Product } from '@/types';

interface ProductPageProps {
    params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
    const product = products.find(p => p.id === params.id) as Product;
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);

    const addItem = useCartStore((state) => state.addItem);

    if (!product) {
        notFound();
    }

    // Get related products from the same category
    const relatedProducts = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4) as Product[];

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addItem(product);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <a href="/" className="hover:text-allegro-orange transition-colors">Home</a>
                        <span>/</span>
                        <a href={`/category/${product.category}`} className="hover:text-allegro-orange transition-colors capitalize">
                            {product.category}
                        </a>
                        <span>/</span>
                        <span className="text-gray-900">{product.title}</span>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                    src={product.images[selectedImage]}
                                    alt={product.title}
                                    width={600}
                                    height={600}
                                    className="w-full h-full object-cover"
                                    priority
                                />
                            </div>

                            {/* Thumbnail Images */}
                            {product.images.length > 1 && (
                                <div className="flex space-x-2 overflow-x-auto">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index
                                                    ? 'border-allegro-orange'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${product.title} ${index + 1}`}
                                                width={80}
                                                height={80}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Product Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Title and Tags */}
                        <div>
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {product.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`px-3 py-1 text-sm font-medium rounded-full ${tag === 'new' ? 'bg-green-100 text-green-800' :
                                                    tag === 'bestseller' ? 'bg-blue-100 text-blue-800' :
                                                        tag === 'limited' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {product.title}
                            </h1>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600">
                                    {product.rating} ({product.reviewCount} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                                <span className="text-4xl font-bold text-gray-900">
                                    {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="text-xl text-gray-500 line-through">
                                        {formatPrice(product.originalPrice)}
                                    </span>
                                )}
                            </div>
                            {product.originalPrice && (
                                <div className="text-green-600 font-medium">
                                    You save {formatPrice(product.originalPrice - product.price)} (
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off)
                                </div>
                            )}
                        </div>

                        {/* Seller Info */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">
                                        Sold by {product.seller.name}
                                    </div>
                                    <div className="flex items-center space-x-1 mt-1">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${i < Math.floor(product.seller.rating)
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            ({product.seller.reviewCount} reviews)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stock Status */}
                        <div className={`p-4 rounded-lg ${product.inStock
                                ? 'bg-green-50 text-green-800'
                                : 'bg-red-50 text-red-800'
                            }`}>
                            <div className="font-medium">
                                {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                            </div>
                            {product.inStock && (
                                <div className="text-sm mt-1">
                                    Ready to ship
                                </div>
                            )}
                        </div>

                        {/* Quantity and Add to Cart */}
                        {product.inStock && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <label className="font-medium text-gray-900">Quantity:</label>
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-allegro-orange text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-allegro-orange-dark transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <ShoppingCart className="h-5 w-5" />
                                        <span>Add to Cart</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="p-4 border border-gray-300 rounded-lg text-gray-600 hover:text-allegro-orange hover:border-allegro-orange transition-colors"
                                    >
                                        <Heart className="h-5 w-5" />
                                    </motion.button>
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="flex items-center space-x-3 text-sm">
                                <Truck className="h-5 w-5 text-allegro-orange" />
                                <span>Free Shipping</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <Shield className="h-5 w-5 text-allegro-orange" />
                                <span>Buyer Protection</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm">
                                <RotateCcw className="h-5 w-5 text-allegro-orange" />
                                <span>30-Day Returns</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Product Description */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 bg-gray-50 p-8 rounded-lg"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </motion.div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="mt-16"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <ProductCard key={relatedProduct.id} product={relatedProduct} />
                            ))}
                        </div>
                    </motion.section>
                )}
            </div>
        </div>
    );
}
