import { useSparkleHighlight } from '../hooks/useSparkleHighlight';

export default function SparkleText({ as: Tag = 'span', className = '', children }) {
  const text = String(children ?? '');
  const highlightMap = useSparkleHighlight(text);

  return (
    <Tag className={className}>
      {[...text].map((char, index) => {
        if (char === '\n') {
          return <br key={`br-${index}`} />;
        }

        const color = highlightMap.get(index);

        return (
          <span
            key={index}
            className="sparkle-text__char"
            style={color ? { color } : undefined}
          >
            {char}
          </span>
        );
      })}
    </Tag>
  );
}
