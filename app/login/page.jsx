'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'superadmin@nav.com', password: 'SuperAdmin@123' },
  { label: 'Admin', email: 'admin@nav.com', password: 'Admin@123' },
  { label: 'User', email: 'user@nav.com', password: 'User@123' },
];

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace('/dashboard');
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="app-loading">Loading...</div>;

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">Nav</h1>
          <p className="login-subtitle">Hospital Management System</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-login" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="demo-accounts">
          <p className="demo-title">Quick login (3 user types)</p>
          <div className="demo-buttons">
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.email} type="button" className="demo-btn" onClick={() => { setEmail(account.email); setPassword(account.password); setError(''); }}>
                {account.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
