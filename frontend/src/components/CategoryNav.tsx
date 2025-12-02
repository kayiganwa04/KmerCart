'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Smartphone,
    Shirt,
    Home,
    Car,
    Dumbbell,
    Book,
    ChevronDown,
    Grid3X3
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import categories from '@/data/categories.json';
import { Category } from '@/types';

const iconMap = {
    Smartphone,
    ShirtIcon: Shirt,
    Home,
    Car,
    Dumbbell,
    Book,
    Grid3X3
};

export default function CategoryNav() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const { currentLocale } = useLanguage();
    const t = useTranslations();

    const getIcon = (iconName: string) => {
        const Icon = iconMap[iconName as keyof typeof iconMap] || Grid3X3;
        return Icon;
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-3">
                    {categories.map((category: Category) => {
                        const Icon = getIcon(category.icon);
                        return (
                            <div
                                key={category.id}
                                className="relative"
                                onMouseEnter={() => setActiveCategory(category.id)}
                                onMouseLeave={() => setActiveCategory(null)}
                            >
                                <Link
                                    href={`/category/${category.id}`}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-allegro-orange hover:bg-gray-50 rounded-lg transition-all whitespace-nowrap group"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{t(`category.${category.id}`)}</span>
                                    {category.subcategories && (
                                        <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
                                    )}
                                </Link>

                                {/* Dropdown Menu */}
                                {activeCategory === category.id && category.subcategories && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                                    >
                                        <div className="py-2">
                                            {category.subcategories.map((subcategory) => (
                                                <Link
                                                    key={subcategory}
                                                    href={`/category/${category.id}/${subcategory.toLowerCase().replace(/\s+/g, '-')}`}
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:text-allegro-orange hover:bg-gray-50 transition-colors"
                                                >
                                                    {subcategory}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
