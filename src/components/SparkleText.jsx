import { useLayoutEffect, useRef } from 'react';
import { gameLog } from '../game/gameLog';
import { useSparkleHighlight } from '../hooks/useSparkleHighlight';

export default function SparkleText({
  as: Tag = 'span',
  className = '',
  children,
  options,
  registry,
  colliderId,
}) {
  const text = String(children ?? '');
  const { highlightMap } = useSparkleHighlight(text, options);
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (!registry || !colliderId) return undefined;

    const root = rootRef.current;
    const seen = [];
    let colored = 0;
    let registered = 0;
    let missingNode = 0;

    [...text].forEach((char, index) => {
      if (char === '\n') return;
      const key = `${colliderId}:${index}`;
      seen.push(key);
      const node = root?.querySelector(`[data-collider-key="${key}"]`) ?? null;
      const color = highlightMap.get(index) ?? null;
      if (color) colored += 1;
      if (node && color) {
        registered += 1;
        registry.register?.(key, node);
        registry.setColor?.(key, color);
      } else {
        if (color && !node) missingNode += 1;
        registry.unregister?.(key);
      }
    });

    gameLog('sparkle sync', {
      id: colliderId,
      letters: seen.length,
      colored,
      registered,
      missingNode,
    });

    return () => {
      seen.forEach((key) => registry.unregister?.(key));
    };
  }, [colliderId, highlightMap, registry, text]);

  return (
    <Tag ref={rootRef} className={className}>
      {[...text].map((char, index) => {
        if (char === '\n') {
          return <br key={`br-${index}`} />;
        }

        const color = highlightMap.get(index);
        const colliderKey = colliderId ? `${colliderId}:${index}` : undefined;
        const isSpace = char.trim() === '';

        return (
          <span
            key={index}
            className={`sparkle-text__char${isSpace ? ' sparkle-text__char--space' : ''}`}
            data-collider-key={colliderKey}
            style={color ? { color } : undefined}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
