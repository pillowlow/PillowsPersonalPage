import accounts from '../data/accounts.json';
import LinkList from '../components/LinkList';
import SparkleText from '../components/SparkleText';
import { useLanguage } from '../context/LanguageContext';
import { useSiteContent } from '../hooks/useSiteContent';

export default function AccountsPage() {
  const { language } = useLanguage();
  const content = useSiteContent();
  const items = accounts.map((account) => ({
    ...account,
    label: language === 'zh' ? account.labelZh : account.labelEn,
    detail: account.handle,
  }));

  return (
    <section className="content-page accounts-page" aria-label={content.pages.accounts.title}>
      <div className="content-page__heading">
        <SparkleText as="h1">{content.pages.accounts.title}</SparkleText>
      </div>
      <LinkList
        items={items}
        variant="account"
        emptyMessage={content.pages.accounts.empty}
      />
    </section>
  );
}
