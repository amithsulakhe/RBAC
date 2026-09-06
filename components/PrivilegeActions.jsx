'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PrivilegeGate from './PrivilegeGate';
import { performAction } from '@/lib/api';

export default function PrivilegeActions({ screenKey, screenLabel }) {
  const { getScreenPrivileges } = useAuth();
  const screenPrivileges = getScreenPrivileges(screenKey);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  const handleAction = async (action) => {
    setMessage('');
    setError('');
    setLoading(action);
    try {
      const result = await performAction(action, screenKey);
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading('');
    }
  };

  const hasRead = screenPrivileges.includes('read');
  const hasWrite = screenPrivileges.includes('write');
  const hasDelete = screenPrivileges.includes('delete');

  return (
    <div className="privilege-actions">
      <h3>Screen Privileges — {screenLabel || screenKey}</h3>
      <p className="privilege-hint">
        Actions are controlled per screen. Buttons and API both check privileges for this screen only.
      </p>

      <div className="privilege-list">
        <span className="privilege-list-label">Privileges on this screen:</span>
        {screenPrivileges.map((p) => (
          <span key={p} className="privilege-tag">{p}</span>
        ))}
        {screenPrivileges.length === 0 && <span className="privilege-none">none</span>}
      </div>

      <div className="action-buttons">
        <PrivilegeGate screenKey={screenKey} privilege="read">
          <button type="button" className="btn-action btn-view" disabled>
            View (read)
          </button>
        </PrivilegeGate>

        <PrivilegeGate screenKey={screenKey} privilege="write">
          <button
            type="button"
            className="btn-action btn-create"
            onClick={() => handleAction('create')}
            disabled={loading === 'create'}
          >
            {loading === 'create' ? 'Creating...' : 'Create (write)'}
          </button>
        </PrivilegeGate>

        <PrivilegeGate screenKey={screenKey} privilege="write">
          <button
            type="button"
            className="btn-action btn-edit"
            onClick={() => handleAction('update')}
            disabled={loading === 'update'}
          >
            {loading === 'update' ? 'Updating...' : 'Edit (write)'}
          </button>
        </PrivilegeGate>

        <PrivilegeGate screenKey={screenKey} privilege="delete">
          <button
            type="button"
            className="btn-action btn-delete"
            onClick={() => handleAction('delete')}
            disabled={loading === 'delete'}
          >
            {loading === 'delete' ? 'Deleting...' : 'Delete (delete)'}
          </button>
        </PrivilegeGate>
      </div>

      {hasRead && !hasWrite && !hasDelete && (
        <p className="privilege-note">Read-only on this screen.</p>
      )}

      {message && <div className="action-success">{message}</div>}
      {error && <div className="action-error">{error}</div>}
    </div>
  );
}
