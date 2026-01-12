/* eslint-disable @typescript-eslint/no-explicit-any */
import {translations} from '@/lib/translations';
import {useEffect, useState} from 'react';

type Language = 'id' | 'en';

export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    // Get language from localStorage or default to 'id'
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'id';
  });

  useEffect(() => {
    // Save language to localStorage when it changes
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return the key if translation is not found
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  return {
    language,
    t,
    changeLanguage,
  };
}
