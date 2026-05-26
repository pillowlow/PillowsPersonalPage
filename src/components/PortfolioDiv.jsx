import { useSiteContent } from '../hooks/useSiteContent';
import { assetUrl } from '../utils/assetUrl';
import PortfolioPortrait from './PortfolioPortrait';

export default function PortfolioDiv() {
  const content = useSiteContent();
  const { email, instagram } = content.links;

  return (
    <section className="portfolio-div">
      <PortfolioPortrait />
      <div className="portfolio-div__links">
        <a
          className="portfolio-div__link"
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
        >
          <img src={assetUrl('/assets/icons/mdi_instagram.svg')} alt="" />
        </a>
        <a className="portfolio-div__link" href={email} aria-label="Email">
          <img src={assetUrl('/assets/icons/ic_outline-email.svg')} alt="" />
        </a>
      </div>
    </section>
  );
}
