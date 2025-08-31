'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const totalItems = useCartStore((state) => state.getTotalItems());

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement search functionality
        console.log('Searching for:', searchQuery);
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="text-2xl font-bold text-allegro-orange"
                        >
                            KmerCart
                        </motion.div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search for products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pl-4 pr-12 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-allegro-orange focus:border-transparent outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 top-0 h-full px-4 bg-allegro-orange text-white rounded-r-lg hover:bg-allegro-orange-dark transition-colors"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Side Icons */}
                    <div className="flex items-center space-x-4">
                        {/* Cart */}
                        <Link href="/cart">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                            >
                                <ShoppingCart className="h-6 w-6" />
                                {totalItems > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 bg-allegro-orange text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                                    >
                                        {totalItems}
                                    </motion.span>
                                )}
                            </motion.div>
                        </Link>

                        {/* User Account */}
                        <Link href="/login">
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden md:flex items-center space-x-2 p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                            >
                                <User className="h-6 w-6" />
                                <span className="text-sm font-medium">Login</span>
                            </motion.div>
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden pb-3">
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pr-12 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-allegro-orange focus:border-transparent outline-none"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full px-4 bg-allegro-orange text-white rounded-r-lg hover:bg-allegro-orange-dark transition-colors"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-200"
                    >
                        <div className="px-4 py-2 space-y-2">
                            <Link
                                href="/login"
                                className="flex items-center space-x-2 p-3 text-gray-700 hover:text-allegro-orange hover:bg-gray-50 rounded-lg transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User className="h-5 w-5" />
                                <span>Login / Register</span>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
