'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, Globe, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import authService from '@/services/auth.service';

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<any>(null);
    const { currentLocale, setCurrentLocale } = useLanguage();
    const totalItems = useCartStore((state) => state.getTotalItems());
    const t = useTranslations();

    useEffect(() => {
        // Check if user is logged in
        const updateUser = () => {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
        };

        updateUser();

        // Listen for auth changes (login/logout/register)
        window.addEventListener('authChanged', updateUser as EventListener);

        return () => {
            window.removeEventListener('authChanged', updateUser as EventListener);
        };
    }, []);

    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
        setIsUserMenuOpen(false);
        router.push('/');
    };

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
                            {t('header.brand')}
                        </motion.div>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder={t('header.searchPlaceholder')}
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
                        {/* Language Selector */}
                        <div className="relative">
                            <button
                                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                                className="flex items-center space-x-2 p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                            >
                                <Globe className="h-5 w-5" />
                                <span className="text-sm font-medium hidden md:block">
                                    {currentLocale === 'en' ? t('common.english') : t('common.french')}
                                </span>
                            </button>
                            <AnimatePresence>
                                {isLanguageMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                                    >
                                        <button
                                            onClick={() => {
                                                setCurrentLocale('en');
                                                setIsLanguageMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentLocale === 'en' ? 'text-allegro-orange font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            {t('common.english')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setCurrentLocale('fr');
                                                setIsLanguageMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${currentLocale === 'fr' ? 'text-allegro-orange font-medium' : 'text-gray-700'
                                                }`}
                                        >
                                            {t('common.french')}
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

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
                        {user ? (
                            <div className="relative hidden md:block">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                                >
                                    <User className="h-6 w-6" />
                                    <span className="text-sm font-medium">{user.firstName}</span>
                                </button>
                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-200">
                                                <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                            {user.role === 'vendor' && (
                                                <Link href="/vendor/dashboard" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-allegro-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                                                    </svg>
                                                    <span>Dashboard</span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login">
                                <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="hidden md:flex items-center space-x-2 p-2 text-gray-700 hover:text-allegro-orange transition-colors"
                                >
                                    <User className="h-6 w-6" />
                                    <span className="text-sm font-medium">{t('header.login')}</span>
                                </motion.div>
                            </Link>
                        )}

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
                                placeholder={t('header.searchPlaceholder')}
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
                            {user ? (
                                <>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                        <p className="text-xs text-gray-500">{user.email}</p>
                                    </div>
                                    {user.role === 'vendor' && (
                                        <Link
                                            href="/vendor/dashboard"
                                            className="flex items-center space-x-2 p-3 w-full text-gray-700 hover:text-allegro-orange hover:bg-gray-50 rounded-lg transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-allegro-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                                            </svg>
                                            <span>Dashboard</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-2 p-3 w-full text-gray-700 hover:text-allegro-orange hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center space-x-2 p-3 text-gray-700 hover:text-allegro-orange hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <User className="h-5 w-5" />
                                    <span>{t('header.login')} / Register</span>
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
