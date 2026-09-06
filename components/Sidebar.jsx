'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import NavIcon from './NavIcon';

function NavChild({ item }) {
  const pathname = usePathname();
  const isActive = pathname === item.route;

  return (
    <Link href={item.route} className={`nav-child ${isActive ? 'active' : ''}`}>
      <NavIcon name={item.icon} />
      <span className="nav-child-label">{item.label}</span>
      {item.badgeCount != null && <span className="nav-badge">{item.badgeCount}</span>}
    </Link>
  );
}

function NavGroup({ item, defaultOpen = false }) {
  const pathname = usePathname();
  const hasActiveChild = item.children?.some(
    (child) => child.route && pathname.startsWith(child.route)
  );
  const [open, setOpen] = useState(defaultOpen || hasActiveChild);
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren && item.route) {
    const isActive = pathname === item.route;
    return (
      <Link href={item.route} className={`nav-group-header solo ${isActive ? 'active' : ''}`}>
        <div className="nav-group-left">
          <span className="nav-group-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-group-title">{item.label}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className={`nav-group ${open ? 'open' : ''}`}>
      <button type="button" className="nav-group-header" onClick={() => setOpen(!open)}>
        <div className="nav-group-left">
          <span className="nav-group-icon-wrap"><NavIcon name={item.icon} /></span>
          <span className="nav-group-title">{item.label}</span>
        </div>
        <span className={`nav-chevron ${open ? 'up' : 'down'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {open && hasChildren && (
        <div className="nav-children">
          {item.children.map((child) => <NavChild key={child.key} item={child} />)}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { navigation, navLoading, selectedHospital } = useApp();

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        {navLoading && <p className="nav-status">Loading navigation...</p>}
        {!navLoading && navigation.length === 0 && (
          <p className="nav-status">No navigation available for your role.</p>
        )}
        {!navLoading && navigation.map((item, index) => (
          <NavGroup key={item.key} item={item} defaultOpen={index === 0 && item.children?.length > 0} />
        ))}
        {selectedHospital && <div className="sidebar-hospital-tag">{selectedHospital.name}</div>}
      </div>
    </aside>
  );
}
