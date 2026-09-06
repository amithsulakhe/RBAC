'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  fetchUsers,
  fetchRoles,
  fetchNavigationItems,
  updateUser,
  updateUserAccess,
  resetUserAccess,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import PrivilegeActions from '@/components/PrivilegeActions';

const ALL_PRIVILEGES = ['read', 'write', 'delete'];

function getConfigurableScreens(navItems) {
  return navItems.filter((item) => item.route || item.key === 'services');
}

function getAccessLabel(user) {
  if (!user.isCustomized) return 'Role default';

  const roleKeys = user.role?.allowedNavKeys || [];
  const customKeys = user.customAllowedNavKeys || [];
  const removed = roleKeys.filter((key) => !customKeys.includes(key));

  if (removed.length) {
    return `Custom · removed ${removed.join(', ')}`;
  }
  return 'Custom access';
}

function UserAccessEditor({ user, navItems, onSave, onReset, onCancel, saving }) {
  const configurableScreens = getConfigurableScreens(navItems);
  const parentItems = navItems.filter((item) => !item.parentKey);
  const getChildren = (parentKey) => navItems.filter((item) => item.parentKey === parentKey);

  const initialKeys = user.isCustomized
    ? user.customAllowedNavKeys || []
    : user.role?.allowedNavKeys || [];
  const initialPrivileges = user.isCustomized
    ? user.customScreenPrivileges || {}
    : user.role?.screenPrivileges || {};

  const [checkedKeys, setCheckedKeys] = useState(initialKeys);
  const [screenPrivileges, setScreenPrivileges] = useState(initialPrivileges);

  const toggleKey = (key) => {
    setCheckedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const toggleScreenPrivilege = (screenKey, privilege) => {
    setScreenPrivileges((prev) => {
      const current = prev[screenKey] || [];
      const updated = current.includes(privilege)
        ? current.filter((p) => p !== privilege)
        : [...current, privilege];
      return { ...prev, [screenKey]: updated };
    });
  };

  return (
    <div className="user-access-editor">
      <div className="user-access-editor-header">
        <h4>Customize access for {user.name}</h4>
        <p>
          Role: <strong>{user.role?.name}</strong> — uncheck items to remove them for this user only.
        </p>
      </div>

      <h5 className="config-section-title">Navigation Access</h5>
      <div className="nav-checklist">
        {parentItems.map((parent) => {
          const children = getChildren(parent.key);
          return (
            <div key={parent.key} className="nav-check-group">
              <label className="nav-check-item parent">
                <input
                  type="checkbox"
                  checked={checkedKeys.includes(parent.key)}
                  onChange={() => toggleKey(parent.key)}
                />
                <span>{parent.label}</span>
                {parent.isDynamic && <span className="dynamic-tag">dynamic</span>}
              </label>
              {children.map((child) => (
                <label key={child.key} className="nav-check-item child">
                  <input
                    type="checkbox"
                    checked={checkedKeys.includes(child.key)}
                    onChange={() => toggleKey(child.key)}
                  />
                  <span>{child.label}</span>
                </label>
              ))}
            </div>
          );
        })}
      </div>

      <h5 className="config-section-title">Per-Screen Privileges</h5>
      <div className="table-wrap">
        <table className="data-table screen-priv-matrix">
          <thead>
            <tr>
              <th>Screen</th>
              {ALL_PRIVILEGES.map((privilege) => (
                <th key={privilege}>{privilege}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configurableScreens.map((screen) => (
              <tr key={screen.key}>
                <td>{screen.label}</td>
                {ALL_PRIVILEGES.map((privilege) => (
                  <td key={privilege} className="priv-matrix-cell">
                    <input
                      type="checkbox"
                      checked={(screenPrivileges[screen.key] || []).includes(privilege)}
                      onChange={() => toggleScreenPrivilege(screen.key, privilege)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="user-access-actions">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onSave(checkedKeys, screenPrivileges)}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Custom Access'}
        </button>
        {user.isCustomized && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onReset}
            disabled={saving}
          >
            Reset to Role Default
          </button>
        )}
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function RoleUserTable({
  roleName,
  users,
  roles,
  navItems,
  editingUserId,
  saving,
  onRoleChange,
  onEdit,
  onSaveAccess,
  onResetAccess,
  onCancelEdit,
}) {
  if (!users.length) return null;

  return (
    <section className="role-user-section">
      <div className="role-user-section-header">
        <h3>{roleName}</h3>
        <span className="role-user-count">{users.length} users</span>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Hospital</th>
              <th>Role</th>
              <th>Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <Fragment key={user._id}>
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.hospital?.name || '—'}</td>
                  <td>
                    <select
                      className="table-select"
                      value={user.role?._id || ''}
                      onChange={(e) => onRoleChange(user._id, e.target.value)}
                      disabled={saving === user._id}
                    >
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>{role.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`access-badge ${user.isCustomized ? 'custom' : 'default'}`}>
                      {user.isCustomized ? 'Customized' : 'Role default'}
                    </span>
                    <div className="access-summary">{getAccessLabel(user)}</div>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => onEdit(user._id)}
                    >
                      {editingUserId === user._id ? 'Close' : 'Customize'}
                    </button>
                  </td>
                </tr>
                {editingUserId === user._id && (
                  <tr key={`${user._id}-editor`} className="user-editor-row">
                    <td colSpan={6}>
                      <UserAccessEditor
                        user={user}
                        navItems={navItems}
                        saving={saving === user._id}
                        onSave={(keys, privileges) => onSaveAccess(user._id, keys, privileges)}
                        onReset={() => onResetAccess(user._id)}
                        onCancel={onCancelEdit}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ScribeManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    async function load() {
      const [userList, roleList, items] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
        fetchNavigationItems(),
      ]);
      setUsers(userList.filter((u) => u.userType !== 'super_admin'));
      setRoles(roleList);
      setNavItems(items);
      setLoading(false);
    }
    load();
  }, []);

  const usersByRole = useMemo(() => {
    const grouped = {};
    for (const role of roles) {
      grouped[role.code] = users.filter((u) => u.role?.code === role.code || u.role?._id === role._id);
    }
    return grouped;
  }, [users, roles]);

  const handleRoleChange = async (userId, roleId) => {
    setSaving(userId);
    try {
      const updated = await updateUser(userId, {
        role: roleId,
        isCustomized: false,
        customAllowedNavKeys: [],
        customScreenPrivileges: {},
      });
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
      if (editingUserId === userId) setEditingUserId(null);
    } finally {
      setSaving(null);
    }
  };

  const handleSaveAccess = async (userId, allowedNavKeys, screenPrivileges) => {
    setSaving(userId);
    try {
      const updated = await updateUserAccess(userId, allowedNavKeys, screenPrivileges);
      setUsers((prev) => prev.map((u) => (u._id === userId ? updated : u)));
    } finally {
      setSaving(null);
    }
  };

  const handleResetAccess = async (userId) => {
    setSaving(userId);
    try {
      const updated = await resetUserAccess(userId);
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
      <p className="page-desc">
        Users are grouped by role. Customize individual access — e.g. remove Dashboard for one Admin while keeping it for another.
      </p>

      <div className="user-stats">
        <span>{users.length} users</span>
        <span>{users.filter((u) => u.isCustomized).length} customized</span>
      </div>

      {roles.map((role) => (
        <RoleUserTable
          key={role._id}
          roleName={role.name}
          users={usersByRole[role.code] || []}
          roles={roles}
          navItems={navItems}
          editingUserId={editingUserId}
          saving={saving}
          onRoleChange={handleRoleChange}
          onEdit={(id) => setEditingUserId((prev) => (prev === id ? null : id))}
          onSaveAccess={handleSaveAccess}
          onResetAccess={handleResetAccess}
          onCancelEdit={() => setEditingUserId(null)}
        />
      ))}

      <PrivilegeActions screenKey="scribe-management" screenLabel="Scribe Management" />
    </div>
  );
}
