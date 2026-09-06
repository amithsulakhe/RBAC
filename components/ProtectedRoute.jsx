import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, superAdminOnly = false }) {
  const { isAuthenticated, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
