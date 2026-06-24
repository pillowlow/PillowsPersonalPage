import { useState } from 'react';
import PlaygroundDiv from '../PlaygroundDiv';
import DigitalPerceptualSlider from '../DigitalPerceptualSlider';
import VirtualTerminal from '../VirtualTerminal';
import MainContentSwitcher from '../MainContentSwitcher';
import LanguageSwitcher from '../LanguageSwitcher';
import DescriptionDiv from '../DescriptionDiv';
import PortfolioDiv from '../PortfolioDiv';
import { useSiteContent } from '../../hooks/useSiteContent';

export default function UpperContainer() {
  const [activeView, setActiveView] = useState('about');
  const [sliderValue, setSliderValue] = useState(50);
  const copy = useSiteContent();

  return (
    <section className="upper-container" aria-label="Introduction">
      <header className="site-header">
        <h1 className="site-header-title">{copy.siteTitle}</h1>
        <div className="site-header__actions">
          <MainContentSwitcher activeView={activeView} onChange={setActiveView} />
          <LanguageSwitcher />
        </div>
      </header>

      <div className="upper-container__body">
        <div className="upper-playground-col">
          <div className="playground-canvas-slot">
            <PlaygroundDiv sliderValue={sliderValue} />
          </div>
          <DigitalPerceptualSlider value={sliderValue} onChange={setSliderValue} />
          <VirtualTerminal />
        </div>

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
