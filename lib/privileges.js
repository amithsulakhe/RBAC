export const ALL_PRIVILEGES = ['read', 'write', 'delete'];

export function normalizeScreenPrivileges(screenPrivileges) {
  if (!screenPrivileges) return {};
  if (screenPrivileges instanceof Map) {
    return Object.fromEntries(screenPrivileges);
  }
  return screenPrivileges;
}

import { getEffectiveScreenPrivileges } from './userAccess';

export function getScreenPrivileges(user) {
  if (!user) return {};
  if (user.userType === 'super_admin') return null;
  return getEffectiveScreenPrivileges(user) || {};
}

export function getPrivilegesForScreen(user, screenKey) {
  if (!user) return [];
  if (user.userType === 'super_admin') return ALL_PRIVILEGES;
  const screenPrivileges = getScreenPrivileges(user);
  return screenPrivileges?.[screenKey] || [];
}

export function hasScreenPrivilege(user, screenKey, privilege) {
  return getPrivilegesForScreen(user, screenKey).includes(privilege);
}
