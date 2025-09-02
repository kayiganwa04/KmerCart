'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import HeroSection from '@/components/HeroSection';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import products from '@/data/products.json';
import { Product } from '@/types';

export default function HomePage() {
    const { currentLocale } = useLanguage();
    const t = useTranslations();
    const featuredProducts = products.slice(0, 8) as Product[];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div>
            <HeroSection />

            {/* Featured Products Section */}
            <section id="featured-products" className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            {t('home.featured.title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('home.featured.subtitle')}
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {featuredProducts.map((product) => (
                            <motion.div key={product.id} variants={itemVariants}>
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Categories Showcase */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            {t('home.categories.title')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('home.categories.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { name: t('category.electronics'), image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=300', href: '/category/electronics' },
                            { name: t('category.fashion'), image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300', href: '/category/fashion' },
                            { name: t('category.home'), image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300', href: '/category/home' },
                            { name: t('category.automotive'), image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300', href: '/category/automotive' },
                            { name: t('category.sports'), image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300', href: '/category/sports' },
                            { name: t('category.books'), image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300', href: '/category/books' },
                        ].map((category, index) => (
                            <motion.a
                                key={category.name}
                                href={category.href}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                className="group bg-white rounded-lg border border-gray-200 hover:border-allegro-orange hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                <div className="aspect-square bg-gray-100 overflow-hidden">
                                    <Image
                                        src={category.image}
                                        alt={category.name}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="font-medium text-gray-900 group-hover:text-allegro-orange transition-colors">
                                        {category.name}
                                    </h3>
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>
            </section>

            {/* Promotion Banner */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-8 lg:p-12 text-center"
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                            {t('home.promotion.title')}
                        </h2>
                        <p className="text-xl mb-8 text-blue-100">
                            {t('home.promotion.subtitle')}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
                        >
                            {t('home.promotion.cta')}
                        </motion.button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
