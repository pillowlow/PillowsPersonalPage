export const ROUTES = [
  { id: 'home', path: '/' },
  { id: 'intro', path: '/intro' },
  { id: 'accounts', path: '/accounts' },
  { id: 'demos', path: '/demos' },
  { id: 'works', path: '/works' },
];

export const HOME_BUTTONS = ['intro', 'accounts', 'demos', 'works'];

const routeByPath = new Map(ROUTES.map((route) => [route.path, route]));

export function normalizeHash(hash = '') {
  const hashPath = hash.replace(/^#/, '').split('?')[0] || '/';
  const path = hashPath.startsWith('/') ? hashPath : `/${hashPath}`;

  return routeByPath.has(path) ? path : '/';
}

export function getRouteByPath(path) {
  return routeByPath.get(normalizeHash(`#${path}`)) ?? routeByPath.get('/');
}
