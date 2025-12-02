import { useLanguage } from '@/contexts/LanguageContext';
import enMessages from '../../translation/en.json';
import frMessages from '../../translation/fr.json';

const messages = {
    en: enMessages,
    fr: frMessages,
};

export function useTranslations() {
    const { currentLocale, isLoaded } = useLanguage();

    const t = (key: string) => {
        // During SSR or before hydration, always return French to prevent mismatches
        if (!isLoaded) {
            const keys = key.split('.');
            let value: any = messages.fr;
            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key;
                }
            }
            return value || key;
        }

        const keys = key.split('.');
        let value: any = messages[currentLocale as keyof typeof messages];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key;
            }
        }
        return value || key;
    };

    return t;
}
