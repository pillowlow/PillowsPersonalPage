import { useMemo, useState } from 'react';
import projectsData from '../data/projects.json';

const FILTER_KEYS = [
  'publications',
  'firstAuthors',
  'artworks',
  'competitions',
  'workshops',
  'others',
];

const FILTER_TYPE_MAP = {
  publications: ['publication', 'poster', 'paper'],
  firstAuthors: ['first-author', 'first-author-paper'],
  artworks: ['artwork'],
  competitions: ['competition'],
  workshops: ['workshop'],
};

function getProjectImages(project) {
  if (Array.isArray(project.images) && project.images.length > 0) {
    return project.images;
  }
  const legacy = [project.img1, project.img2].filter(Boolean);
  return legacy;
}

function normalizeProject(project) {
  return {
    ...project,
    images: getProjectImages(project),
  };
}

function hasCredits(project) {
  return (project.credits ?? []).some((credit) => String(credit ?? '').trim() !== '');
}

function projectMatchesFilters(project, activeFilters) {
  if (!hasCredits(project)) {
    return Boolean(activeFilters.others);
  }

  const types = project.types ?? [];
  return types.some((type) => {
    for (const [filterKey, typeNames] of Object.entries(FILTER_TYPE_MAP)) {
      if (!activeFilters[filterKey]) continue;
      if (typeNames.includes(type)) return true;
    }
    return false;
  });
}

const defaultFilters = Object.fromEntries(FILTER_KEYS.map((key) => [key, true]));

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
