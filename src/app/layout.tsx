import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';

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
        <html lang="fr">
            <body className={inter.className}>
                <LanguageProvider>
                    <Header />
                    <CategoryNav />
                    <main className="min-h-screen bg-allegro-gray">
                        {children}
                    </main>
                    <Footer />
                </LanguageProvider>
            </body>
        </html>
    );
}
