import { useSiteContent } from '../../hooks/useSiteContent';
import { PALETTE_COLORS } from '../../theme';
import LanguageSwitcher from '../LanguageSwitcher';
import SparkleText from '../SparkleText';

const headerSparkle = { highlightColors: PALETTE_COLORS };

export default function SiteHeader({ routeId }) {
  const content = useSiteContent();
  const isHome = routeId === 'home';

  return (
    <header className="site-header">
      <a className="site-header-title" href="#/">
        <SparkleText as="span" options={headerSparkle}>
          {content.siteTitle}
        </SparkleText>
      </a>
      <div className="site-header__actions">
        {!isHome && (
          <a className="top-bar-btn" href="#/" aria-label={content.nav.back}>
            <svg className="top-bar-btn__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 14 4 9l5-5M4 9h10a6 6 0 1 1 0 12H9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinejoin="miter"
              />
            </svg>
          </a>
        )}
        <LanguageSwitcher />
      </div>
    </header>
  );
}
