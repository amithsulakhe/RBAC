'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Header from './Header';
import Sidebar from './Sidebar';
import Unauthorized from './pages/Unauthorized';
import { collectAllowedRoutes, isPathAllowed } from '@/utils/navigationAccess';

export default function MainShell({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { navLoading, navigation } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) return <div className="app-loading">Loading...</div>;
  if (!isAuthenticated) return null;

  const allowedRoutes = collectAllowedRoutes(navigation);
  const authorized = navLoading || isPathAllowed(pathname, allowedRoutes);

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          {navLoading ? <div className="page-loading">Loading...</div> : !authorized ? <Unauthorized /> : children}
        </main>
      </div>
    </div>
  );
}
