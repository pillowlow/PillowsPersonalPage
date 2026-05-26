import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';

const PORTRAIT_PATH = '/assets/cover/portrait.jpg';

export default function PortfolioPortrait() {
  const content = useSiteContent();

  return (
    <div className="portfolio-portrait">
      <img
        className="portfolio-portrait__image"
        src={assetUrl(PORTRAIT_PATH)}
        alt={content.portfolio.alt}
      />
    </div>
  );
}
