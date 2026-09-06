'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Unauthorized() {
  const { userTypeLabel } = useAuth();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
        </div>
        <h2>Access Denied</h2>
        <p className="unauthorized-message">
          You don&apos;t have access to this page.
        </p>
        <p className="unauthorized-detail">
          Your account ({userTypeLabel}) is not authorized to view this resource.
          Please contact your administrator if you believe this is a mistake.
        </p>
        <Link href="/dashboard" className="btn-primary unauthorized-btn">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
