'use client';

import { useAuth } from '@/context/AuthContext';

export default function PrivilegeGate({ screenKey, privilege, children, fallback = null }) {
  const { hasPrivilege } = useAuth();

  if (!hasPrivilege(screenKey, privilege)) {
    return fallback;
  }

  return children;
}
