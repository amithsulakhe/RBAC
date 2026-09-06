export const ROUTE_TO_SCREEN = {
  '/dashboard': 'dashboard',
  '/masters/hospital-branch': 'hospital-branch',
  '/masters/provider': 'provider',
  '/masters/dummy-provider': 'dummy-provider',
  '/masters/master': 'master',
  '/masters/automated-email': 'automated-email',
  '/scheduling': 'scheduling',
  '/scribe-management': 'scribe-management',
  '/revenue-billing': 'revenue-billing',
  '/reports': 'reports',
  '/role-config': 'role-config',
};

export function pathnameToScreenKey(pathname) {
  if (ROUTE_TO_SCREEN[pathname]) {
    return ROUTE_TO_SCREEN[pathname];
  }
  if (pathname.startsWith('/services/')) {
    return 'services';
  }
  return null;
}
