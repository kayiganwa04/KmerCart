'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden max-w-sm mx-auto"
        >
            <Link href={`/product/${product.id}`}>
                <div className="relative overflow-hidden bg-gray-50">
                    {/* Tags */}
                    {product.tags && product.tags.length > 0 && (
                        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
                            {product.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className={`px-2 py-1 text-xs font-medium rounded-md shadow-sm ${tag === 'premium' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                        tag === 'cleaning' ? 'bg-teal-100 text-teal-700 border border-teal-200' :
                                            tag === 'new' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                tag === 'bestseller' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    tag === 'limited' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                        }`}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <Image
                        src={product.image}
                        alt={product.title}
                        width={400}
                        height={300}
                        className="w-full h-64 object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                        priority={false}
                    />

                    {/* Stock Status Overlay */}
                    {!product.inStock && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                            <span className="bg-white px-4 py-2 rounded-lg text-sm font-medium text-gray-900">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-lg font-medium text-gray-900 mb-3 group-hover:text-allegro-orange transition-colors line-clamp-2">
                        {product.title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < Math.floor(product.rating)
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">
                            ({product.reviewCount})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Seller */}
                    <div className="text-sm text-gray-600 mb-6">
                        by {product.seller.name}
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className={`w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-medium text-lg transition-colors ${product.inStock
                            ? 'bg-allegro-orange text-white hover:bg-allegro-orange-dark shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                    </motion.button>
                </div>
            </Link>
        </motion.div>
    );
}