'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Filter, Grid, List, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import ProductCard from '@/components/ProductCard';
import products from '@/data/products.json';
import categories from '@/data/categories.json';
import { Product, Category } from '@/types';

interface CategoryPageProps {
    params: { id: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('featured');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
    const [inStockOnly, setInStockOnly] = useState(false);
    const { currentLocale } = useLanguage();
    const t = useTranslations();

    const category = categories.find(c => c.id === params.id) as Category;
    if (!category) {
        notFound();
    }

    // Filter products by category
    let categoryProducts = products.filter(p => p.category === params.id) as Product[];

    // Apply filters
    if (inStockOnly) {
        categoryProducts = categoryProducts.filter(p => p.inStock);
    }

    categoryProducts = categoryProducts.filter(
        p => p.price >= priceRange.min && p.price <= priceRange.max
    );

    // Apply sorting
    switch (sortBy) {
        case 'price-low':
            categoryProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            categoryProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            categoryProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            // In a real app, you'd sort by creation date
            categoryProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            // Featured - keep original order
            break;
    }

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
        <div className="bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <nav className="mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <a href="/" className="hover:text-allegro-orange transition-colors">{t('home.hero.title')}</a>
                            <span>/</span>
                            <span className="text-gray-900 capitalize">{category.name}</span>
                        </div>
                    </nav>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 capitalize">{category.name}</h1>
                            <p className="text-gray-600 mt-2">
                                {categoryProducts.length} {categoryProducts.length !== 1 ? t('common.products') : t('common.product')} {t('common.productsFound')}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                                    ? 'bg-allegro-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                    ? 'bg-allegro-orange text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Filters and Sorting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 bg-gray-50 p-4 rounded-lg"
                >
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Filters Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 text-gray-700 hover:text-allegro-orange transition-colors"
                        >
                            <Filter className="h-5 w-5" />
                            <span>{t('common.filters')}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Sort Dropdown */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">{t('common.sortBy')}</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-allegro-orange focus:border-transparent outline-none"
                            >
                                <option value="featured">{t('common.featured')}</option>
                                <option value="price-low">{t('common.priceLowToHigh')}</option>
                                <option value="price-high">{t('common.priceHighToLow')}</option>
                                <option value="rating">{t('common.highestRated')}</option>
                                <option value="newest">{t('common.newest')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-gray-200"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.priceRange')}
                                    </label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                value={priceRange.min}
                                                onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                placeholder={t('common.min')}
                                            />
                                            <span className="text-gray-500">to</span>
                                            <input
                                                type="number"
                                                value={priceRange.max}
                                                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                                placeholder={t('common.max')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {t('common.availability')}
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={inStockOnly}
                                                onChange={(e) => setInStockOnly(e.target.checked)}
                                                className="h-4 w-4 text-allegro-orange focus:ring-allegro-orange border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{t('common.inStockOnly')}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Subcategories */}
                                {category.subcategories && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('common.subcategories')}
                                        </label>
                                        <div className="space-y-2">
                                            {category.subcategories.map((subcategory) => (
                                                <label key={subcategory} className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 text-allegro-orange focus:ring-allegro-orange border-gray-300 rounded"
                                                    />
                                                    <span className="ml-2 text-sm text-gray-700">{subcategory}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </motion.div>

                {/* Products Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`grid gap-6 ${viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                        }`}
                >
                    {categoryProducts.map((product) => (
                        <motion.div key={product.id} variants={itemVariants}>
                            {viewMode === 'grid' ? (
                                <ProductCard product={product} />
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center space-x-6 hover:shadow-lg transition-shadow">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        width={96}
                                        height={96}
                                        className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">{product.title}</h3>
                                        <p className="text-gray-600 text-sm mb-2">{t('product.by')} {product.seller.name}</p>
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xl font-bold text-gray-900">
                                                ${product.price}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                                <span className="text-yellow-400">★</span>
                                                <span className="text-sm text-gray-600">
                                                    {product.rating} ({product.reviewCount})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="bg-allegro-orange text-white px-6 py-2 rounded-lg hover:bg-allegro-orange-dark transition-colors">
                                        {t('common.addToCart')}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* No Products Found */}
                {categoryProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center py-16"
                    >
                        <div className="text-gray-400 mb-4">
                            <Filter className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-600 mb-6">
                            Try adjusting your filters or browse other categories
                        </p>
                        <button
                            onClick={() => {
                                setPriceRange({ min: 0, max: 2000 });
                                setInStockOnly(false);
                            }}
                            className="bg-allegro-orange text-white px-6 py-3 rounded-lg hover:bg-allegro-orange-dark transition-colors"
                        >
                            Clear Filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
