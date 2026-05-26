import { theme } from '../theme';

/**
 * Project type categories — colors resolved from theme.palette (see theme.js).
 * Order: publications → firstAuthors → artworks → competitions → others
 */
export const PROJECT_TYPE_CATEGORIES = [
  { id: 'publications', types: ['publication', 'poster', 'paper'] },
  { id: 'firstAuthors', types: ['first-author', 'first-author-paper'] },
  { id: 'artworks', types: ['artwork'] },
  { id: 'competitions', types: ['competition', 'workshop'] },
  { id: 'others', types: ['other'] },
];

const typeToCategory = new Map();
PROJECT_TYPE_CATEGORIES.forEach((category) => {
  category.types.forEach((type) => typeToCategory.set(type, category.id));
});

export function getCategoryColor(categoryId) {
  return theme.palette[categoryId] ?? theme.palette.others;
}

export function getTypeTagCategory(type) {
  if (typeToCategory.has(type)) {
    return typeToCategory.get(type);
  }
  return 'others';
}

export function getTypeTagClassName(type) {
  return `project-card__type-tag--${getTypeTagCategory(type)}`;
}

export function getFilterOptionClassName(filterKey) {
  return `project-filters-dropdown__option--${filterKey}`;
}
