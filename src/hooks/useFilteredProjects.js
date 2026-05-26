import { useMemo, useState } from 'react';
import projectsData from '../data/projects.json';

const FILTER_KEYS = [
  'publications',
  'firstAuthors',
  'artworks',
  'competitions',
  'others',
];

const FILTER_TYPE_MAP = {
  publications: ['publication', 'poster', 'paper'],
  firstAuthors: ['first-author', 'first-author-paper'],
  artworks: ['artwork'],
  competitions: ['competition', 'workshop'],
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

function projectMatchesFilters(types, activeFilters) {
  if (!types || types.length === 0) {
    return activeFilters.others;
  }

  return types.some((type) => {
    if (activeFilters.others && (!isKnownType(type) || type === 'other')) {
      return true;
    }
    for (const filterKey of FILTER_KEYS) {
      if (filterKey === 'others' || !activeFilters[filterKey]) continue;
      if ((FILTER_TYPE_MAP[filterKey] ?? []).includes(type)) {
        return true;
      }
    }
    return false;
  });
}

function isKnownType(type) {
  return FILTER_KEYS.some((key) => {
    if (key === 'others') return false;
    return (FILTER_TYPE_MAP[key] ?? []).includes(type);
  });
}

const defaultFilters = Object.fromEntries(FILTER_KEYS.map((key) => [key, true]));

export function useFilteredProjects() {
  const [activeFilters, setActiveFilters] = useState(defaultFilters);

  const projects = useMemo(() => {
    const normalized = projectsData.map(normalizeProject);

    const filtered = normalized.filter((project) => {
      const types = project.types ?? [];
      if (types.length === 0) return activeFilters.others;
      return projectMatchesFilters(types, activeFilters);
    });

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
