import DescriptionDiv from '../components/DescriptionDiv';
import PortfolioDiv from '../components/PortfolioDiv';
import { useSiteContent } from '../hooks/useSiteContent';

export default function IntroPage() {
  const content = useSiteContent();

  return (
    <section className="intro-page" aria-label="Introduction">
      <div className="intro-page__top">
        <DescriptionDiv sectionKey="about" />
        <div className="intro-page__identity">
          <p className="intro-page__eyebrow">{content.pages.intro.title}</p>
          <PortfolioDiv />
        </div>
      </div>
      <div className="intro-page__bottom">
        <DescriptionDiv sectionKey="mission" />
      </div>
    </section>
  );
}
