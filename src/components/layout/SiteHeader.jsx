import { useSiteContent } from '../../hooks/useSiteContent';
import LanguageSwitcher from '../LanguageSwitcher';
import SparkleText from '../SparkleText';

export default function SiteHeader({ routeId }) {
  const content = useSiteContent();
  const isHome = routeId === 'home';

  return (
    <header className="site-header">
      <a className="site-header-title" href="#/">
        <SparkleText as="span">{content.siteTitle}</SparkleText>
      </a>
      <div className="site-header__actions">
        {!isHome && (
          <a className="switcher-btn site-header__back" href="#/">
            {content.nav.back}
          </a>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
