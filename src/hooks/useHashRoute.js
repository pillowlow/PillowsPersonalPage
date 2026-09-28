import { useCallback, useEffect, useState } from 'react';
import { getRouteByPath, normalizeHash } from '../routes';

function getCurrentPath() {
  if (typeof window === 'undefined') return '/';
  return normalizeHash(window.location.hash);
}

export default function useHashRoute() {
  const [path, setPath] = useState(getCurrentPath);

  useEffect(() => {
    const handleHashChange = () => setPath(getCurrentPath());

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((nextPath) => {
    const route = getRouteByPath(nextPath);
    const nextHash = `#${route.path}`;

    if (window.location.hash === nextHash) {
      setPath(route.path);
      return;
    }

    window.location.hash = nextHash;
  }, []);

  const route = getRouteByPath(path);

  return {
    path: route.path,
    routeId: route.id,
    navigate,
  };
}
