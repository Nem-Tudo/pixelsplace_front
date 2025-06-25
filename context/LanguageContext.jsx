import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import en from '../locales/en.js';
import pt from '../locales/pt.js';

const LANG_MAP = { en, pt };
const DEFAULT_LANG = 'en';

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

        return currentValue ?? fallbackValue ?? `{{${key}}}`;
    }

    interpolate(template, params) {
        return template.replace(/{{(.*?)}}/g, (_, param) =>
            params[param] !== undefined ? params[param] : `{{${param}}}`
        );
    }

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

    return (
        <LanguageContext.Provider value={{ lang, language, changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);