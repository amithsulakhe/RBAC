function normalizeScreenPrivileges(screenPrivileges) {
  if (!screenPrivileges) return {};
  if (screenPrivileges instanceof Map) {
    return Object.fromEntries(screenPrivileges);
  }
  return screenPrivileges;
}

export function getEffectiveAllowedNavKeys(user) {
  if (!user || user.userType === 'super_admin') return null;
  if (user.isCustomized) {
    return user.customAllowedNavKeys || [];
  }
  return user.role?.allowedNavKeys || [];
}

export function getEffectiveScreenPrivileges(user) {
  if (!user || user.userType === 'super_admin') return null;
  if (user.isCustomized) {
    return normalizeScreenPrivileges(user.customScreenPrivileges);
  }
  return normalizeScreenPrivileges(user.role?.screenPrivileges);
}

export function getAccessSummary(user) {
  if (!user?.isCustomized) return 'Role default';

  const roleKeys = user.role?.allowedNavKeys || [];
  const effectiveKeys = user.customAllowedNavKeys || [];
  const removed = roleKeys.filter((key) => !effectiveKeys.includes(key));
  const added = effectiveKeys.filter((key) => !roleKeys.includes(key));

  const parts = [];
  if (removed.length) parts.push(`Removed: ${removed.join(', ')}`);
  if (added.length) parts.push(`Added: ${added.join(', ')}`);
  return parts.length ? parts.join(' · ') : 'Custom (same nav as role)';
}
