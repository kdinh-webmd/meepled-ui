import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import vi from './vi.json';

// EN/VI, mirroring the prototype's `T` dictionary. Anonymous users get a toggle;
// logged-in users persist their choice in settings (stored on the user record).
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'vi'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'meepled.lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
