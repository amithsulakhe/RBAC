'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

export default function Header() {
  const { currentUser, logout, userTypeLabel } = useAuth();
  const { hospitals, selectedHospital, selectHospital, loading } = useApp();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">Nav</h1>
        {currentUser && (
          <span className="user-badge">
            {currentUser.name}
            <span className="user-type">{userTypeLabel}</span>
          </span>
        )}
      </div>
      <div className="header-right">
        <div className="header-control">
          <label className="header-label" htmlFor="hospital-select">Hospital</label>
          <select
            id="hospital-select"
            className="header-select"
            value={selectedHospital?._id || ''}
            onChange={(e) => selectHospital(e.target.value)}
            disabled={loading || hospitals.length === 0}
          >
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>{hospital.name}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
}
