'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { currentLocale } = useLanguage();
    const t = useTranslations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement login logic here
        console.log('Login attempt:', { email, password, rememberMe });
    };

    return (
        <div className="min-h-screen bg-allegro-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full space-y-8"
            >
                {/* Back Button */}
                <Link href="/">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-allegro-orange transition-colors mb-4"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span>{t('common.backToStore')}</span>
                    </motion.button>
                </Link>

                {/* Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h1 className="text-3xl font-bold text-allegro-orange mb-2">KmerCart</h1>
                        <h2 className="text-2xl font-bold text-gray-900">{t('auth.signInToAccount')}</h2>
                        <p className="mt-2 text-gray-600">
                            {t('auth.orCreateNewAccount')}
                        </p>
                    </motion.div>
                </div>

                {/* Login Form */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white rounded-lg shadow-lg p-8"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('auth.emailAddress')}
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-allegro-orange focus:border-transparent outline-none transition-all"
                                    placeholder={t('auth.enterEmail')}
                                />
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('auth.password')}
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-allegro-orange focus:border-transparent outline-none transition-all"
                                    placeholder={t('auth.enterPassword')}
                                />
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-allegro-orange focus:ring-allegro-orange border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    {t('auth.rememberMe')}
                                </label>
                            </div>
                            <Link
                                href="/forgot-password"
                                className="text-sm text-allegro-orange hover:text-allegro-orange-dark transition-colors"
                            >
                                {t('auth.forgotPassword')}
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-allegro-orange text-white py-3 px-4 rounded-lg font-medium text-lg hover:bg-allegro-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-allegro-orange focus:ring-offset-2"
                        >
                            {t('auth.signIn')}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">{t('common.orContinueWith')}</span>
                            </div>
                        </div>

                        {/* Social Login Buttons */}
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <span>{t('common.google')}</span>
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                            >
                                <span>{t('common.facebook')}</span>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="text-center text-sm text-gray-600"
                >
                    {t('common.bySigningIn')}{' '}
                    <Link href="/terms" className="text-allegro-orange hover:text-allegro-orange-dark transition-colors">
                        {t('auth.termsOfService')}
                    </Link>{' '}
                    {t('common.and')}{' '}
                    <Link href="/privacy" className="text-allegro-orange hover:text-allegro-orange-dark transition-colors">
                        {t('auth.privacyPolicy')}
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
