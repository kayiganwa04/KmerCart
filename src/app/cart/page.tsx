'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
    const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (items.length === 0) {
        return (
            <div className="bg-white min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center"
                    >
                        <ShoppingBag className="h-24 w-24 text-gray-400 mx-auto mb-6" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Looks like you haven't added anything to your cart yet.
                        </p>
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-allegro-orange text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-allegro-orange-dark transition-colors"
                            >
                                Continue Shopping
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="flex items-center space-x-4 mb-4">
                        <Link href="/">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-gray-600 hover:text-allegro-orange transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </motion.button>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    </div>
                    <p className="text-gray-600">
                        {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.product.id}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center space-x-4">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <Link href={`/product/${item.product.id}`}>
                                            <Image
                                                src={item.product.image}
                                                alt={item.product.title}
                                                width={100}
                                                height={100}
                                                className="w-24 h-24 object-cover rounded-lg hover:opacity-75 transition-opacity"
                                            />
                                        </Link>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/product/${item.product.id}`}
                                            className="text-lg font-medium text-gray-900 hover:text-allegro-orange transition-colors line-clamp-2"
                                        >
                                            {item.product.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            by {item.product.seller.name}
                                        </p>
                                        <div className="flex items-center space-x-4 mt-3">
                                            <span className="text-xl font-bold text-gray-900">
                                                {formatPrice(item.product.price)}
                                            </span>
                                            {item.product.originalPrice && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    {formatPrice(item.product.originalPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </motion.button>
                                            <span className="px-4 py-2 font-medium text-gray-900 min-w-[3rem] text-center">
                                                {item.quantity}
                                            </span>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </motion.button>
                                        </div>

                                        {/* Remove Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => removeItem(item.product.id)}
                                            className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                                    <span className="text-sm text-gray-600">
                                        {item.quantity} × {formatPrice(item.product.price)}
                                    </span>
                                    <span className="text-lg font-bold text-gray-900">
                                        {formatPrice(item.product.price * item.quantity)}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {/* Clear Cart Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="pt-4"
                        >
                            <button
                                onClick={clearCart}
                                className="text-red-500 hover:text-red-700 font-medium transition-colors"
                            >
                                Clear Cart
                            </button>
                        </motion.div>
                    </div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-gray-50 rounded-lg p-6 sticky top-32">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(getTotalPrice())}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium text-green-600">Free</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax</span>
                                    <span className="font-medium">{formatPrice(getTotalPrice() * 0.08)}</span>
                                </div>

                                <div className="border-t border-gray-300 pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-lg font-bold text-gray-900">Total</span>
                                        <span className="text-lg font-bold text-gray-900">
                                            {formatPrice(getTotalPrice() * 1.08)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-allegro-orange text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-allegro-orange-dark transition-colors mt-6"
                            >
                                Proceed to Checkout
                            </motion.button>

                            <div className="mt-4 text-center">
                                <Link
                                    href="/"
                                    className="text-allegro-orange hover:text-allegro-orange-dark font-medium transition-colors"
                                >
                                    Continue Shopping
                                </Link>
                            </div>

                            {/* Security Features */}
                            <div className="mt-6 pt-6 border-t border-gray-300">
                                <div className="text-sm text-gray-600 space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Secure 256-bit SSL encryption</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>30-day money-back guarantee</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Free shipping on all orders</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
