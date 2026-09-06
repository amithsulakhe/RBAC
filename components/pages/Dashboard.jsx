'use client';

import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import PrivilegeActions from '@/components/PrivilegeActions';

export default function Dashboard() {
  const { currentUser, isSuperAdmin, userTypeLabel, screenPrivileges } = useAuth();
  const { selectedHospital, navigation } = useApp();

  const servicesSection = navigation.find((n) => n.key === 'services');
  const serviceCount = servicesSection?.children?.length || 0;

  const privilegeEntries = isSuperAdmin
    ? [['All screens', 'read, write, delete']]
    : Object.entries(screenPrivileges || {});

  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="info-cards">
        <div className="info-card">
          <span className="info-label">Logged in as</span>
          <span className="info-value">{currentUser?.name}</span>
        </div>
        <div className="info-card">
          <span className="info-label">User Type</span>
          <span className="info-value">{userTypeLabel}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Role</span>
          <span className="info-value">
            {isSuperAdmin ? 'All Access' : currentUser?.role?.name || '—'}
          </span>
        </div>
        <div className="info-card">
          <span className="info-label">Hospital</span>
          <span className="info-value">{selectedHospital?.name || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Services Available</span>
          <span className="info-value">{serviceCount}</span>
        </div>
        <div className="info-card">
          <span className="info-label">Nav Items Visible</span>
          <span className="info-value">{navigation.length}</span>
        </div>
      </div>

      <div className="screen-privileges-table-wrap">
        <h3>Your screen privileges</h3>
        <table className="data-table screen-priv-table">
          <thead>
            <tr>
              <th>Screen</th>
              <th>Privileges</th>
            </tr>
          </thead>
          <tbody>
            {privilegeEntries.map(([screen, privs]) => (
              <tr key={screen}>
                <td>{screen}</td>
                <td>
                  {(Array.isArray(privs) ? privs : privs.split(', ')).map((p) => (
                    <span key={p} className="privilege-tag">{p}</span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrivilegeActions screenKey="dashboard" screenLabel="Dashboard" />
    </div>
  );
}
