import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import settings from '@/settings.js';

// Importação automática síncrona usando Object.fromEntries
const LANG_MAP = Object.fromEntries(
    settings.availableLanguages.map(lang => {
        try {
            // Usando require para importação síncrona
            const module = require(`../locales/${lang}.js`);
            return [lang, module.default || module];
        } catch (error) {
            console.warn(`Arquivo de idioma não encontrado: ${lang}.js`);
            return [lang, {}];
        }
    })
);

const DEFAULT_LANG = settings.defaultLanguage;

class TranslationManager {
    constructor(currentLang, fallbackLang) {
        this.currentStrings = LANG_MAP[currentLang] || {};
        this.fallbackStrings = LANG_MAP[fallbackLang] || {};
    }

    // Helper method to get nested value from object using dot notation
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    getTemplate(key, count) {
        const isPlural = typeof count === 'number' && count !== 1;
        const actualKey = isPlural ? `${key}__PLURAL` : key;

        // Try to get nested value first from current strings, then fallback strings
        const currentValue = this.getNestedValue(this.currentStrings, actualKey);
        const fallbackValue = this.getNestedValue(this.fallbackStrings, actualKey);

        if (typeof window != "undefined" && window.TEST_STRINGS_ENABLED) return `{{${actualKey}}}`;

        return currentValue ?? fallbackValue ?? `{{${key}}}`;
    }

    interpolate(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, param) =>
            params[param] !== undefined ? params[param] : `{{${param}}}`
        );
    }

    /**
     * Recebe a tradução adequada de uma frase baseada na sua estrutura dos locales
     * @param {string} key - A frase a ser adquirida
     * @param {string} params - Valores das placeholders
     */
    getString(key, params = {}) {
        const template = this.getTemplate(key, params.count);
        return this.interpolate(template, params);
    }
}

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [lang, setLang] = useState(DEFAULT_LANG);
    const [language, setLanguage] = useState(
        new TranslationManager(DEFAULT_LANG, DEFAULT_LANG)
    );

    useEffect(() => {
        const cookieLang = Cookies.get('lang');

        let initialLang = DEFAULT_LANG;

        if (cookieLang && LANG_MAP[cookieLang]) {
            initialLang = cookieLang;
        } else {
            const browserLang = navigator.language?.split('-')[0];
            if (LANG_MAP[browserLang]) {
                initialLang = browserLang;
            }
        }

        setLang(initialLang);
        setLanguage(new TranslationManager(initialLang, DEFAULT_LANG));
    }, []);

    const changeLanguage = (newLang) => {
        if (!LANG_MAP[newLang]) return alert("Unsupported language");
        Cookies.set('lang', newLang, { expires: 365 });
        setLang(newLang);
        setLanguage(new TranslationManager(newLang, DEFAULT_LANG));
    };

    const availableLanguages = Object.keys(LANG_MAP);

    return (
        <LanguageContext.Provider value={{ lang, language, changeLanguage, availableLanguages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

