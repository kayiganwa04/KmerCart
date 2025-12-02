'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
    currentLocale: string;
    setCurrentLocale: (locale: string) => void;
    isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [currentLocale, setCurrentLocale] = useState('fr'); // French as default
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedLocale = localStorage.getItem('language') || 'fr'; // French as default
        setCurrentLocale(savedLocale);
        setIsLoaded(true);
    }, []);

    const handleSetCurrentLocale = (locale: string) => {
        setCurrentLocale(locale);
        localStorage.setItem('language', locale);
    };

    return (
        <LanguageContext.Provider value={{ currentLocale, setCurrentLocale: handleSetCurrentLocale, isLoaded }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
