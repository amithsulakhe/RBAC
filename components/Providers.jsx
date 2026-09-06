'use client';

import { AuthProvider } from '@/context/AuthContext';
import { AppProvider } from '@/context/AppContext';
import MainShell from '@/components/MainShell';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <AppProvider>
        <MainShell>{children}</MainShell>
      </AppProvider>
    </AuthProvider>
  );
}
