import { useMemo, useState } from 'react';
import projectsData from '../data/projects.json';

const FILTER_KEYS = [
  'papers',
  'posters',
  'demos',
  'exhibitions',
  'competitions',
  'workshops',
  'firstAuthors',
  'groupArtworks',
  'others',
];

const PRIMARY_CREDIT_TYPES = new Set(['paper', 'competition', 'exhibition']);

function getProjectImages(project) {
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images;
  }
  const legacy = [project.img1, project.img2].filter(Boolean);
  return legacy;
}

function normalizeProject(project) {
  const creditType = Array.isArray(project.creditType)
    ? [...new Set(project.creditType)]
    : [];
  const normalizedCreditType = creditType.some((value) => PRIMARY_CREDIT_TYPES.has(value))
    || creditType.includes('others')
    ? creditType
    : [...creditType, 'others'];
  const authorship = Array.isArray(project.authorship)
    ? [...new Set(project.authorship)]
    : project.authorship
      ? [project.authorship]
      : [];

  return {
    ...project,
    creditType: normalizedCreditType,
    type: Array.isArray(project.type) ? project.type : [],
    images: getProjectImages(project),
    authorship,
  };
}

function projectMatchesFilters(project, activeFilters) {
  const creditTypes = project.creditType ?? [];
  const types = project.type ?? [];
  const authorships = project.authorship ?? [];
  const matches = {
    papers: creditTypes.includes('paper') || types.includes('full-paper'),
    posters: types.includes('poster'),
    demos: types.includes('demo'),
    exhibitions: creditTypes.includes('exhibition') || types.includes('exhibition'),
    competitions: creditTypes.includes('competition') || types.includes('competition'),
    workshops: types.includes('workshop'),
    firstAuthors: authorships.includes('first-author'),
    groupArtworks: authorships.includes('group-artwork'),
    others: creditTypes.includes('others'),
  };

  const matchesUncheckedFilter = FILTER_KEYS.some(
    (key) => activeFilters[key] === false && matches[key],
  );

  if (matchesUncheckedFilter) return false;

  return FILTER_KEYS.some((key) => activeFilters[key] && matches[key]);
}

const defaultFilters = Object.fromEntries(
  FILTER_KEYS.map((key) => [key, key !== 'others']),
);

export function useFilteredProjects() {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const projects = useMemo(() => {
    const normalized = projectsData.map(normalizeProject);

    const filtered = normalized.filter((project) => projectMatchesFilters(project, activeFilters));

    return filtered.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return String(a.id).localeCompare(String(b.id));
    });
  }, [activeFilters]);

  const toggleFilter = (key) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return {
    projects,
    activeFilters,
    toggleFilter,
    filterKeys: FILTER_KEYS,
  };
}
