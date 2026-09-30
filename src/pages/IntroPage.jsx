import DescriptionDiv from '../components/DescriptionDiv';
import PortfolioDiv from '../components/PortfolioDiv';

export default function IntroPage() {
  return (
    <section className="intro-page" aria-label="Introduction">
      <div className="intro-page__top">
        <DescriptionDiv sectionKey="about" />
        <div className="intro-page__identity">
          <PortfolioDiv />
        </div>
      </div>
      <div className="intro-page__bottom">
        <DescriptionDiv sectionKey="mission" />
      </div>
    </section>
  );
}
