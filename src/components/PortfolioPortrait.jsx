import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';

const PORTRAIT_SOURCES = [
  { path: '/assets/cover/portrait-320.jpg', width: 320 },
  { path: '/assets/cover/portrait-640.jpg', width: 640 },
];
const PORTRAIT_SIZES = '(max-width: 767px) 120px, 152px';

export default function PortfolioPortrait() {
  const content = useSiteContent();

  return (
    <div className="portfolio-portrait">
      <img
        className="portfolio-portrait__image"
        src={assetUrl(PORTRAIT_SOURCES[1].path)}
        srcSet={PORTRAIT_SOURCES.map(({ path, width }) => `${assetUrl(path)} ${width}w`).join(', ')}
        sizes={PORTRAIT_SIZES}
        alt={content.portfolio.alt}
        width="640"
        height="640"
        decoding="async"
      />
    </div>
  );
}
