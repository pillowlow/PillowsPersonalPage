import { useRef, useState } from 'react';
import { useSiteContent } from '../hooks/useSiteContent';
import { getFilterOptionClassName } from '../utils/projectTypeColors';

export default function ProjectFilters({ activeFilters, toggleFilter, filterKeys }) {
  const content = useSiteContent();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const activeCount = filterKeys.filter((key) => activeFilters[key]).length;

  const handleBlur = (e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setOpen(false);
    }
  };

  return (
    <div
      className="project-filters-dropdown"
      ref={containerRef}
      onBlur={handleBlur}
    >
      <button
        type="button"
        className="switcher-btn project-filters-dropdown__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
      >
        {content.sections.filter}
        {activeCount < filterKeys.length && (
          <span className="project-filters-dropdown__badge">{activeCount}</span>
        )}
      </button>
      {open && (
        <ul className="project-filters-dropdown__menu" role="listbox" aria-multiselectable="true">
          {filterKeys.map((key) => (
            <li key={key} role="option" aria-selected={activeFilters[key]}>
              <label
                className={`project-filters-dropdown__option ${getFilterOptionClassName(key)}`}
              >
                <span className="project-filters-dropdown__swatch" aria-hidden="true" />
                <input
                  type="checkbox"
                  checked={activeFilters[key]}
                  onChange={() => toggleFilter(key)}
                />
                <span className="project-filters-dropdown__label">{content.filters[key]}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
