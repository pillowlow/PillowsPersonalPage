import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';

export default function LanguageSwitcher() {
  const { toggleLanguage } = useLanguage();
  const content = useSiteContent();

  return (
    <button type="button" className="switcher-btn" onClick={toggleLanguage}>
      {content.switchers.language}
    </button>
  );
}
