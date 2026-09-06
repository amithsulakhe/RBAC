import NavigationItem from './models/NavigationItem';
import Service from './models/Service';
import { getEffectiveAllowedNavKeys } from './userAccess';

function buildTree(items, parentKey = null) {
  return items
    .filter((item) => item.parentKey === parentKey)
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.key),
    }));
}

function filterByAllowedKeys(items, allowedKeys) {
  const allowedSet = new Set(allowedKeys);

  return items
    .map((item) => {
      const filteredChildren = item.children?.length
        ? filterByAllowedKeys(item.children, allowedKeys)
        : [];

      const isAllowed = allowedSet.has(item.key);
      const hasAllowedChildren = filteredChildren.length > 0;

      if (isAllowed || hasAllowedChildren) {
        return { ...item, children: filteredChildren };
      }
      return null;
    })
    .filter(Boolean);
}

async function attachHospitalServices(tree, hospitalId) {
  if (!hospitalId) return tree;

  const services = await Service.find({ hospital: hospitalId, isActive: true }).sort({ order: 1 });

  return tree.map((item) => {
    if (item.key !== 'services') return item;

    const serviceChildren = services.map((service) => ({
      key: `service-${service.slug}`,
      label: service.name,
      icon: 'service',
      route: service.route,
      parentKey: 'services',
      order: service.order,
      badgeCount: null,
      isDynamic: true,
      children: [],
    }));

    return { ...item, children: serviceChildren };
  });
}

export async function getNavigationForUser(user, hospitalId) {
  const allItems = await NavigationItem.find({ isActive: true }).lean();
  let tree = buildTree(allItems);

  if (user.userType === 'super_admin') {
    tree = await attachHospitalServices(tree, hospitalId);
    return tree;
  }

  const allowedKeys = getEffectiveAllowedNavKeys(user) || [];
  tree = filterByAllowedKeys(tree, allowedKeys);

  if (allowedKeys.includes('services')) {
    tree = await attachHospitalServices(tree, hospitalId);
  }

  return tree;
}
