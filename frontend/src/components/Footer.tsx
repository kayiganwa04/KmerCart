'use client';

import { useTranslations } from '@/hooks/useTranslations';

export default function Footer() {
    const t = useTranslations();
    
    return (
        <footer className="bg-allegro-dark-gray text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">KmerCart</h3>
                        <p className="text-gray-300">
                            {t('footer.description')}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer.customerService')}</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.returnsRefunds')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.shippingInfo')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.contactUs')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.aboutUs')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.careers')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.press')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.investors')}</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacyPolicy')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.termsOfService')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.cookiePolicy')}</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
                    <p>{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
}
