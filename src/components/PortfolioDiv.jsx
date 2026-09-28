import accounts from '../data/accounts.json';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';
import PortfolioPortrait from './PortfolioPortrait';

export default function PortfolioDiv() {
  const content = useSiteContent();
  const { language } = useLanguage();
  const introAccounts = accounts.filter((account) => account.showOnIntro);

  return (
    <section className="portfolio-div">
      <PortfolioPortrait />
      <div className="portfolio-div__links">
        {introAccounts.map((account) => {
          const label = language === 'zh' ? account.labelZh : account.labelEn;
          const isExternal = account.href.startsWith('http');

          return (
            <a
              key={account.id}
              className="portfolio-div__link"
              href={account.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              aria-label={label}
            >
              {account.icon && <img src={assetUrl(account.icon)} alt="" />}
            </a>
          );
        })}
      </div>
    </section>
  );
}
