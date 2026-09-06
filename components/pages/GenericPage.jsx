'use client';

import PrivilegeActions from '@/components/PrivilegeActions';

export default function GenericPage({ title, description, screenKey }) {
  return (
    <div className="page">
      <h2>{title}</h2>
      <p>{description}</p>
      <PrivilegeActions screenKey={screenKey} screenLabel={title} />
    </div>
  );
}
