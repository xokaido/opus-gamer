// Internationalization system
import { en } from './en';
import type { TranslationKey } from './en';
import { ru } from './ru';
import { ka } from './ka';
import { STORAGE_KEYS } from '../utils/constants';

export type Language = 'en' | 'ru' | 'ka';

type TranslationStrings = {
    [K in TranslationKey]: string;
};

const translations: Record<Language, TranslationStrings> = {
    en: en as TranslationStrings,
    ru: ru as TranslationStrings,
    ka: ka as TranslationStrings,
};

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский' },
    { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
];

let currentLanguage: Language = 'en';

export function initI18n(): void {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language | null;
    if (saved && translations[saved]) {
        currentLanguage = saved;
    } else {
        // Try to detect browser language
        const browserLang = navigator.language.split('-')[0] as Language;
        if (translations[browserLang]) {
            currentLanguage = browserLang;
        }
    }
}

export function t(key: TranslationKey): string {
    return translations[currentLanguage][key] || translations.en[key] || key;
}

export function getCurrentLanguage(): Language {
    return currentLanguage;
}

export function setLanguage(lang: Language): void {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
        // Dispatch event for UI updates
        window.dispatchEvent(new CustomEvent('languagechange', { detail: lang }));
    }
}

export function getAvailableLanguages(): typeof LANGUAGES {
    return LANGUAGES;
}
