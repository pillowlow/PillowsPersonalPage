import { useState } from 'react';
import { HOME_BUTTONS } from '../routes';
import { theme } from '../theme';
import GameCanvas from '../components/home/GameCanvas';
import GameHud from '../components/home/GameHud';
import SparkleText from '../components/SparkleText';
import useColliderRegistry from '../hooks/useColliderRegistry';
import { useSiteContent } from '../hooks/useSiteContent';

export default function HomePage() {
  const content = useSiteContent();
  const registry = useColliderRegistry();
  const [preset, setPreset] = useState(() => {
    if (typeof window === 'undefined') return 'casual';
    return window.localStorage.getItem('pillow-game-preset') === 'normal'
      ? 'normal'
      : 'casual';
  });
  const [hud, setHud] = useState({ score: 0, combo: 0, lastEvent: null });

  const handlePresetChange = (nextPreset) => {
    setPreset(nextPreset);
    window.localStorage.setItem('pillow-game-preset', nextPreset);
  };

  return (
    <section className="home-page" aria-label={content.siteTitle}>
      <div className="home-stage" ref={registry.rootRef}>
        <GameCanvas registry={registry} preset={preset} onHud={setHud} />

        <div className="home-ui">
          <p className="home-page__hint">{content.home.hint}</p>
          <nav className="home-link-stack" aria-label="Main links">
            {HOME_BUTTONS.map((routeId) => (
              <a
                key={routeId}
                ref={(node) => registry.registerButton?.(routeId, node)}
                className="glow-button"
                href={`#/${routeId}`}
                data-route={routeId}
              >
                <SparkleText
                  as="span"
                  options={theme.home.buttonSparkle}
                  registry={registry}
                  colliderId={routeId}
                >
                  {content.nav[routeId]}
                </SparkleText>
              </a>
            ))}
          </nav>
          <GameHud
            {...hud}
            preset={preset}
            onPresetChange={handlePresetChange}
          />
        </div>

        <svg className="home-effects" aria-hidden="true" focusable="false">
          <defs>
            <filter id="glow-button-filter" x="-30%" y="-30%" width="160%" height="160%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.025 0.08"
                numOctaves="1"
                seed="7"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="2"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      </div>
    </section>
  );
}
