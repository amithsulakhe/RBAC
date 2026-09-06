export function collectAllowedRoutes(navigation) {
  const routes = new Set();

  function walk(items) {
    for (const item of items) {
      if (item.route) {
        routes.add(item.route);
      }
      if (item.children?.length) {
        walk(item.children);
      }
    }
  }

  walk(navigation);
  return routes;
}

export function isPathAllowed(pathname, allowedRoutes) {
  if (allowedRoutes.has(pathname)) {
    return true;
  }

  if (pathname.startsWith('/services/')) {
    return allowedRoutes.has(pathname);
  }

  return false;
}
