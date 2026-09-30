import demos from '../data/demos.json';
import LinkList from '../components/LinkList';
import SparkleText from '../components/SparkleText';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';

export default function DemosPage() {
  const { language } = useLanguage();
  const content = useSiteContent();
  const items = demos.map((demo) => {
    const title = language === 'zh' ? demo.titleZh : demo.titleEn;
    const description = language === 'zh' ? demo.descriptionZh : demo.descriptionEn;
    const tags = demo.tags?.length ? demo.tags.join(' · ') : '';
    const detail = [demo.year, description, tags].filter(Boolean).join(' · ');

    return {
      ...demo,
      label: title,
      detail,
    };
  });

  return (
    <section className="content-page demos-page" aria-label={content.pages.demos.title}>
      <div className="content-page__heading">
        <SparkleText as="h1">{content.pages.demos.title}</SparkleText>
      </div>
      <LinkList items={items} variant="demo" emptyMessage={content.pages.demos.empty} />
    </section>
  );
}
