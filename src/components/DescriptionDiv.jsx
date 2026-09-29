import { useSiteContent } from '../hooks/useSiteContent';
import SparkleText from './SparkleText';

export default function DescriptionDiv({ sectionKey }) {
  const content = useSiteContent();
  const section = content.mainContent[sectionKey];

  return (
    <section className="description-div">
      <SparkleText as="h2">{section.title}</SparkleText>
      <SparkleText as="p" className="description-div__body">
        {section.body}
      </SparkleText>
    </section>
  );
}
