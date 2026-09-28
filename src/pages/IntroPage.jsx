import { useState } from 'react';
import MainContentSwitcher from '../components/MainContentSwitcher';
import DescriptionDiv from '../components/DescriptionDiv';
import PortfolioDiv from '../components/PortfolioDiv';
import SparkleText from '../components/SparkleText';
import { useSiteContent } from '../hooks/useSiteContent';

export default function IntroPage() {
  const [activeView, setActiveView] = useState('about');
  const content = useSiteContent();

  return (
    <section className="intro-page" aria-label="Introduction">
      <header className="intro-page__header">
        <SparkleText as="h1">{content.pages.intro.title}</SparkleText>
        <div className="intro-page__actions">
          <MainContentSwitcher activeView={activeView} onChange={setActiveView} />
        </div>
      </header>

      <div className="intro-page__body">
        <aside className="intro-panel">
          <div className="intro-panel__identity">
            <PortfolioDiv />
          </div>
          <DescriptionDiv activeView={activeView} />
        </aside>
      </div>
    </section>
  );
}
