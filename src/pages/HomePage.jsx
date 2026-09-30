import { useCallback, useEffect, useRef, useState } from 'react';
import { HOME_BUTTONS } from '../routes';
import { theme } from '../theme';
import GameCanvas from '../components/home/GameCanvas';
import GameHud from '../components/home/GameHud';
import PortfolioPortrait from '../components/PortfolioPortrait';
import SparkleText from '../components/SparkleText';
import useColliderRegistry from '../hooks/useColliderRegistry';
import { useSiteContent } from '../hooks/useSiteContent';

const DEFAULT_PROFILE_COLOR = '#F4F4F4';

export default function HomePage() {
  const content = useSiteContent();
  const registry = useColliderRegistry();
  const [hud, setHud] = useState({ score: 0, combo: 0, lastEvent: null });
  const [profileBuzz, setProfileBuzz] = useState({
    active: false,
    color: DEFAULT_PROFILE_COLOR,
    key: 0,
  });
  const profileBuzzTimerRef = useRef(null);

  const handleHud = useCallback((payload) => {
    setHud(payload);
    if (payload?.type === 'portrait' && payload.color) {
      setProfileBuzz((current) => ({
        active: true,
        color: payload.color,
        key: current.key + 1,
      }));
      window.clearTimeout(profileBuzzTimerRef.current);
      profileBuzzTimerRef.current = window.setTimeout(() => {
        setProfileBuzz((current) => ({
          ...current,
          active: false,
          color: DEFAULT_PROFILE_COLOR,
        }));
        profileBuzzTimerRef.current = null;
      }, theme.home.portraitBuzzMs ?? 420);
    }
  }, []);

  useEffect(() => () => {
    window.clearTimeout(profileBuzzTimerRef.current);
  }, []);

  return (
    <section className="home-page" aria-label={content.siteTitle}>
      <div className="home-stage" ref={registry.rootRef}>
        <GameCanvas registry={registry} onHud={handleHud} />

        <div className="home-ui">
          <div className="home-profile" aria-label={content.siteTitle}>
            <div
              className={`home-profile__frame${profileBuzz.active ? ' home-profile__frame--buzzing' : ''}`}
              style={{ '--profile-accent': profileBuzz.color }}
              ref={(node) => registry.registerObstacle?.('portrait', node, { shape: 'circle' })}
            >
              <PortfolioPortrait />
              {profileBuzz.active && (
                <span
                  key={profileBuzz.key}
                  className="home-profile__buzz"
                  aria-hidden="true"
                />
              )}
            </div>
          </div>
          <p className="home-page__hint">{content.home.hint}</p>
          <nav
            className="home-link-stack"
            aria-label="Main links"
            data-game-collider-scope
          >
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
          <GameHud {...hud} />
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
            <filter id="portrait-buzz-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.7 0.12"
                numOctaves="2"
                seed="13"
                result="portrait-noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="portrait-noise"
                scale="3"
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
