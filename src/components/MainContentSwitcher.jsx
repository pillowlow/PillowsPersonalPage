import { useSiteContent } from '../hooks/useSiteContent';

export default function MainContentSwitcher({ activeView, onChange }) {
  const content = useSiteContent();

  const handleToggle = () => {
    onChange(activeView === 'mission' ? 'about' : 'mission');
  };

  return (
    <button
      type="button"
      className="switcher-btn"
      onClick={handleToggle}
      aria-pressed={activeView === 'mission'}
      aria-label={content.switchers.mainContent}
    >
      {content.switchers.mainContent}
    </button>
  );
}
