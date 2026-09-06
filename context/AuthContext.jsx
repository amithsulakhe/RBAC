'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { fetchMe, login as apiLogin, logout as apiLogout, getToken } from '@/lib/api';

const AuthContext = createContext(null);

const USER_TYPE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  user: 'User',
};

const ALL_PRIVILEGES = ['read', 'write', 'delete'];

function normalizeScreenPrivileges(screenPrivileges) {
  if (!screenPrivileges) return {};
  return screenPrivileges;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await fetchMe();
        setCurrentUser(user);
      } catch {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const isSuperAdmin = currentUser?.userType === 'super_admin';

  const screenPrivileges = useMemo(() => {
    if (!currentUser) return {};
    if (isSuperAdmin) return null;
    return normalizeScreenPrivileges(currentUser.role?.screenPrivileges);
  }, [currentUser, isSuperAdmin]);

  const hasPrivilege = useCallback(
    (screenKey, privilege) => {
      if (isSuperAdmin) return true;
      const privileges = screenPrivileges?.[screenKey] || [];
      return privileges.includes(privilege);
    },
    [isSuperAdmin, screenPrivileges]
  );

  const getScreenPrivileges = useCallback(
    (screenKey) => {
      if (isSuperAdmin) return ALL_PRIVILEGES;
      return screenPrivileges?.[screenKey] || [];
    },
    [isSuperAdmin, screenPrivileges]
  );

  const login = async (email, password) => {
    const { user } = await apiLogin(email, password);
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    await apiLogout();
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.userType === 'admin';
  const isUser = currentUser?.userType === 'user';

  const userTypeLabel = currentUser
    ? USER_TYPE_LABELS[currentUser.userType] || currentUser.userType
    : '';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isSuperAdmin,
        isAdmin,
        isUser,
        userTypeLabel,
        screenPrivileges,
        hasPrivilege,
        getScreenPrivileges,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
