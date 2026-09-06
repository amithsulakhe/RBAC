'use client';

import { useEffect, useState } from 'react';
import {
  fetchRoles,
  fetchNavigationItems,
  updateRoleNavigation,
  updateRoleScreenPrivileges,
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';

const ALL_PRIVILEGES = ['read', 'write', 'delete'];

function getConfigurableScreens(navItems) {
  return navItems.filter((item) => item.route || item.key === 'services');
}

export default function RoleConfig() {
  const { isSuperAdmin } = useAuth();
  const { refreshNavigation } = useApp();
  const [roles, setRoles] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedKeys, setCheckedKeys] = useState([]);
  const [screenPrivileges, setScreenPrivileges] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const configurableScreens = getConfigurableScreens(navItems);

  useEffect(() => {
    async function load() {
      const [roleList, items] = await Promise.all([
        fetchRoles(),
        fetchNavigationItems(),
      ]);
      setRoles(roleList);
      setNavItems(items);
      if (roleList.length > 0) {
        selectRole(roleList[0]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const selectRole = (role) => {
    setSelectedRole(role);
    setCheckedKeys(role.allowedNavKeys || []);
    setScreenPrivileges(role.screenPrivileges || {});
  };

  const handleRoleSelect = (role) => selectRole(role);

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

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const [updatedNav, updatedPriv] = await Promise.all([
        updateRoleNavigation(selectedRole._id, checkedKeys),
        updateRoleScreenPrivileges(selectedRole._id, screenPrivileges),
      ]);
      const merged = {
        ...updatedNav,
        screenPrivileges: updatedPriv.screenPrivileges,
      };
      setRoles((prev) => prev.map((r) => (r._id === merged._id ? merged : r)));
      setSelectedRole(merged);
      await refreshNavigation();
    } finally {
      setSaving(false);
    }
  };

  const parentItems = navItems.filter((item) => !item.parentKey);
  const getChildren = (parentKey) => navItems.filter((item) => item.parentKey === parentKey);

  if (!isSuperAdmin) {
    return (
      <div className="page">
        <h2>Access Denied</h2>
        <p>Only Super Admin can configure roles.</p>
      </div>
    );
  }

  if (loading) return <div className="page"><p>Loading roles...</p></div>;

  return (
    <div className="page">
      <h2>Role Configuration</h2>
      <p className="page-desc">
        Configure navigation access and per-screen privileges (read, write, delete) for each role.
      </p>

      <div className="role-config-layout role-config-wide">
        <div className="role-list">
          <h3>Roles</h3>
          {roles.map((role) => (
            <button
              key={role._id}
              type="button"
              className={`role-item ${selectedRole?._id === role._id ? 'active' : ''}`}
              onClick={() => handleRoleSelect(role)}
            >
              <span className="role-name">{role.name}</span>
              <span className="role-code">{role.code}</span>
            </button>
          ))}
        </div>

        <div className="nav-config">
          <h3>Config for: {selectedRole?.name}</h3>

          <h4 className="config-section-title">Navigation Access</h4>
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

          <h4 className="config-section-title">Per-Screen Privileges</h4>
          <div className="table-wrap">
            <table className="data-table screen-priv-matrix">
              <thead>
                <tr>
                  <th>Screen</th>
                  <th>read</th>
                  <th>write</th>
                  <th>delete</th>
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

          <button
            type="button"
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
