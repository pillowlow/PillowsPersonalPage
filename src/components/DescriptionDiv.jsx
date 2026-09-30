import { useSiteContent } from '../hooks/useSiteContent';
import SparkleText from './SparkleText';

function renderBody(section) {
  if (!section.links?.length) {
    return (
      <SparkleText as="p" className="description-div__body">
        {section.body}
      </SparkleText>
    );
  }

  let parts = [{ type: 'text', value: section.body }];
  section.links.forEach((link) => {
    parts = parts.flatMap((part) => {
      if (part.type !== 'text') return [part];
      const index = part.value.indexOf(link.text);
      if (index < 0) return [part];

      return [
        { type: 'text', value: part.value.slice(0, index) },
        { type: 'link', ...link },
        { type: 'text', value: part.value.slice(index + link.text.length) },
      ];
    });
  });

  return (
    <p className="description-div__body">
      {parts.map((part, index) => (
        part.type === 'link' ? (
          <a
            key={`link-${part.text}-${index}`}
            href={part.href}
            target="_blank"
            rel="noreferrer"
          >
            {part.text}
          </a>
        ) : (
          part.value && (
            <SparkleText as="span" key={`text-${index}`}>
              {part.value}
            </SparkleText>
          )
        )
      ))}
    </p>
  );
}

export default function DescriptionDiv({ sectionKey }) {
  const content = useSiteContent();
  const section = content.mainContent[sectionKey];

  return (
    <section className="description-div">
      <SparkleText as="h2">{section.title}</SparkleText>
      {renderBody(section)}
    </section>
  );
}
