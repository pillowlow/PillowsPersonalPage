import { useSiteContent } from '../../hooks/useSiteContent';

export default function GameHud({
  score = 0,
  combo = 0,
  lastEvent,
  preset = 'casual',
  onPresetChange,
}) {
  const content = useSiteContent();
  const eventLabel =
    lastEvent?.type === 'match'
      ? content.hud.match
      : lastEvent?.type === 'miss'
        ? content.hud.miss
        : '';

  return (
    <div className="game-hud" aria-live="polite">
      <div className="game-hud__stats">
        <span>
          {content.hud.score}: <strong>{score}</strong>
        </span>
        <span>
          {content.hud.combo}: <strong>{combo}</strong>
        </span>
        {eventLabel && <span className="game-hud__event">{eventLabel}</span>}
      </div>
      <div className="game-hud__controls" role="group" aria-label="Game difficulty">
        <button
          type="button"
          className={`game-hud__button ${preset === 'casual' ? 'is-active' : ''}`}
          aria-pressed={preset === 'casual'}
          onClick={() => onPresetChange?.('casual')}
        >
          {content.hud.easy}
        </button>
        <button
          type="button"
          className={`game-hud__button ${preset === 'normal' ? 'is-active' : ''}`}
          aria-pressed={preset === 'normal'}
          onClick={() => onPresetChange?.('normal')}
        >
          {content.hud.pro}
        </button>
      </div>
    </div>
  );
}
