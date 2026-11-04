import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TranslationService } from './translation';
import { getApiKey, validateApiKey } from '../config/translation';

export type SupportedLanguage = 'en' | 'af' | 'zu' | 'xh' | 'tn' | 've' | 'ts' | 'nso' | 'st' | 'nr' | 'ss';

const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'Zulu',
  xh: 'Xhosa',
  tn: 'Tswana',
  ve: 'Tshivenda',
  ts: 'Xitsonga',
  nso: 'Sepedi',
  st: 'Sesotho',
  nr: 'Ndebele',
  ss: 'Swati',
};

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Initialize translation service with API key
  React.useEffect(() => {
    const apiKey = getApiKey();
    if (validateApiKey(apiKey)) {
      TranslationService.initialize(apiKey);
      console.log('Translation service initialized successfully');
    } else {
      console.warn('Invalid or missing Google Cloud Translation API key. Please set GOOGLE_CLOUD_TRANSLATION_API_KEY environment variable or update config/translation.ts');
    }
  }, []);

  // Async translation function using TranslationService
  const t = async (text: string) => {
    if (language === 'en') return text;
    try {
      return await TranslationService.translateText(text, language, 'en');
    } catch (e) {
      return text; // fallback to original text on error
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const getLanguageName = (lang: SupportedLanguage) => languageNames[lang];
