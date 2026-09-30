import { useEffect, useRef } from 'react';
import { createGame } from '../../game/createGame';
import { theme } from '../../theme';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

export default function GameCanvas({ registry, onHud }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    registry.setCanvasElement(canvas);
    const game = createGame({
      canvas,
      config: theme.game,
      getColliders: registry.getColliders,
      remeasure: registry.remeasure,
      getCharColor: registry.getCharColor,
      onEvent: onHud,
      reducedMotion: prefersReducedMotion,
    });
    gameRef.current = game;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      game.resize({
        width: rect.width,
        height: rect.height,
        dpr: window.devicePixelRatio || 1,
      });
      registry.remeasure?.();
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(resize)
        : null;
    resizeObserver?.observe(canvas.parentElement ?? canvas);
    resize();
    game.start();

    return () => {
      resizeObserver?.disconnect();
      game.destroy();
      gameRef.current = null;
      registry.setCanvasElement(null);
    };
  }, [onHud, prefersReducedMotion, registry]);

  useEffect(() => {
    gameRef.current?.setReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      aria-label="Interactive color matching game"
    />
  );
}
