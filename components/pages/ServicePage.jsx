'use client';

import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import PrivilegeActions from '@/components/PrivilegeActions';

export default function ServicePage() {
  const { slug } = useParams();
  const { selectedHospital, navigation } = useApp();

  const servicesSection = navigation.find((n) => n.key === 'services');
  const service = servicesSection?.children?.find((s) => s.key === `service-${slug}`);

  if (!service) {
    return (
      <div className="page">
        <h2>Service not found</h2>
        <p>This service is not available for {selectedHospital?.name || 'the selected hospital'} or your role.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>{service.label}</h2>
      <p>Hospital: <strong>{selectedHospital?.name}</strong></p>
      <p>Service page content goes here.</p>
      <PrivilegeActions screenKey="services" screenLabel={service.label} />
    </div>
  );
}
