import { useSiteContent } from '../hooks/useSiteContent';
import SparkleText from './SparkleText';

export default function DescriptionDiv({ activeView }) {
  const content = useSiteContent();
  const section = content.mainContent[activeView];

  return (
    <section className="description-div" aria-live="polite">
      <SparkleText as="h1">{section.title}</SparkleText>
      <SparkleText as="p" className="description-div__body">
        {section.body}
      </SparkleText>
    </section>
  );
}
