import { useSiteContent } from '../../hooks/useSiteContent';

export default function GameHud({
  score = 0,
  combo = 0,
  lastEvent,
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
    </div>
  );
}
