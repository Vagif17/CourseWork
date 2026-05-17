import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from './locales/en';
import { ru } from './locales/ru';
import { az } from './locales/az';
import { zh } from './locales/zh';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en,
            ru,
            az,
            zh
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
