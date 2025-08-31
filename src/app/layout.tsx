import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'KmerCart - Modern E-commerce Marketplace',
    description: 'Discover amazing products from trusted sellers worldwide. Shop electronics, fashion, home goods and more.',
    keywords: 'ecommerce, marketplace, online shopping, electronics, fashion, krakow, poland',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Header />
                <CategoryNav />
                <main className="min-h-screen bg-allegro-gray">
                    {children}
                </main>
                <footer className="bg-allegro-dark-gray text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">KmerCart</h3>
                                <p className="text-gray-300">
                                    Your trusted marketplace for quality products from around the world.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Customer Service</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Company</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Investors</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-4">Legal</h4>
                                <ul className="space-y-2 text-gray-300">
                                    <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                                    <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
                            <p>&copy; 2025 KmerCart. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </body>
        </html>
    );
}
