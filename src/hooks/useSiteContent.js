import { useMemo } from 'react';
import siteData from '../data/site.json';
import { useLanguage } from '../context/LanguageContext';

export function useSiteContent() {
  const { language } = useLanguage();

  return useMemo(() => siteData[language] ?? siteData.en, [language]);
}
