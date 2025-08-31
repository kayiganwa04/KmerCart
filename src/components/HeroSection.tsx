'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
    return (
        <section className="bg-gradient-to-r from-allegro-orange to-allegro-orange-dark text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                            Discover Amazing Products
                        </h1>
                        <p className="text-xl lg:text-2xl mb-8 text-orange-100">
                            Shop millions of products from trusted sellers worldwide.
                            Get the best deals with fast, secure delivery.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="#featured-products"
                                    className="inline-block bg-white text-allegro-orange px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                                >
                                    Shop Now
                                </Link>
                            </motion.div>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/category/electronics"
                                    className="inline-block border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-allegro-orange transition-colors"
                                >
                                    Browse Electronics
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Hero Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative w-full h-96 lg:h-[500px]">
                            <Image
                                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"
                                alt="Shopping illustration"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-16 pt-16 border-t border-orange-300"
                >
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-2">10M+</div>
                        <div className="text-orange-100">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-2">500K+</div>
                        <div className="text-orange-100">Sellers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-2">50M+</div>
                        <div className="text-orange-100">Happy Customers</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl lg:text-4xl font-bold mb-2">99.9%</div>
                        <div className="text-orange-100">Uptime</div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
