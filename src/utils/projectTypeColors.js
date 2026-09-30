import { theme } from '../theme';

export const CREDIT_TYPE_CATEGORIES = [
  { id: 'papers', values: ['paper'] },
  { id: 'competitions', values: ['competition'] },
  { id: 'exhibitions', values: ['exhibition'] },
  { id: 'others', values: ['others'] },
];

export const FORMAT_TYPE_CATEGORIES = [
  { id: 'fullPapers', values: ['full-paper'] },
  { id: 'posters', values: ['poster'] },
  { id: 'demos', values: ['demo'] },
  { id: 'exhibitions', values: ['exhibition'] },
  { id: 'competitions', values: ['competition'] },
  { id: 'workshops', values: ['workshop'] },
];

const creditTypeToCategory = new Map();
CREDIT_TYPE_CATEGORIES.forEach((category) => {
  category.values.forEach((value) => creditTypeToCategory.set(value, category.id));
});

const formatTypeToCategory = new Map();
FORMAT_TYPE_CATEGORIES.forEach((category) => {
  category.values.forEach((value) => formatTypeToCategory.set(value, category.id));
});

export function getCategoryColor(categoryId) {
  return theme.palette[categoryId] ?? theme.palette.others;
}

export function getCreditTypeCategory(value) {
  return creditTypeToCategory.get(value) ?? 'others';
}

export function getFormatTypeCategory(value) {
  return formatTypeToCategory.get(value) ?? 'others';
}

export function getCreditTypeClassName(value) {
  return `project-card__credit-type--${getCreditTypeCategory(value)}`;
}

export function getTypeTagClassName(value) {
  return `project-card__type-tag--${getFormatTypeCategory(value)}`;
}

export function getFilterOptionClassName(filterKey) {
  return `project-filters-dropdown__option--${filterKey}`;
}
