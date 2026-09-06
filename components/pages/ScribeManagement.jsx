'use client';

import { useEffect, useState } from 'react';
import { fetchUsers, fetchRoles, updateUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import PrivilegeActions from '@/components/PrivilegeActions';

export default function ScribeManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    async function load() {
      const [userList, roleList] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);
      setUsers(userList.filter((u) => u.userType !== 'super_admin'));
      setRoles(roleList);
      setLoading(false);
    }
    load();
  }, []);

  const handleRoleChange = async (userId, roleId) => {
    setSaving(userId);
    try {
      const updated = await updateUser(userId, { role: roleId });
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    } finally {
      setSaving(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="page">
        <h2>Access Denied</h2>
        <p>Only Super Admin can manage users.</p>
      </div>
    );
  }

  if (loading) return <div className="page"><p>Loading users...</p></div>;

  return (
    <div className="page">
      <h2>User Management</h2>
      <p className="page-desc">Manage Admin and User accounts. Role determines sidebar navigation visibility.</p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>User Type</th>
              <th>Hospital</th>
              <th>Role</th>
              <th>Screen Privileges</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`type-tag type-${user.userType}`}>
                    {user.userType === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>{user.hospital?.name || '—'}</td>
                <td>
                  <select
                    className="table-select"
                    value={user.role?._id || ''}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={saving === user._id}
                  >
                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>{role.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className="screen-priv-summary">
                    {Object.keys(user.role?.screenPrivileges || {}).length} screens
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrivilegeActions screenKey="scribe-management" screenLabel="Scribe Management" />
    </div>
  );
}
