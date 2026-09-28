import { useEffect } from 'react';
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

  useEffect(() => {
    if (!registry || !colliderId) return;

    [...text].forEach((char, index) => {
      if (char === '\n') return;
      registry.setColor?.(`${colliderId}:${index}`, highlightMap.get(index) ?? null);
    });
  }, [colliderId, highlightMap, registry, text]);

  return (
    <Tag className={className}>
      {[...text].map((char, index) => {
        if (char === '\n') {
          return <br key={`br-${index}`} />;
        }

        const color = highlightMap.get(index);
        const colliderKey = colliderId ? `${colliderId}:${index}` : undefined;

        return (
          <span
            key={index}
            className="sparkle-text__char"
            data-collider-key={colliderKey}
            ref={(node) => {
              if (!registry || !colliderKey) return;
              if (node) {
                registry.register?.(colliderKey, node);
              } else {
                registry.unregister?.(colliderKey);
              }
            }}
            style={color ? { color } : undefined}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
