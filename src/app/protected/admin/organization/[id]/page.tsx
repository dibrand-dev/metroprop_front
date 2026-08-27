'use client';

import { use } from 'react';
import OrganizationProfile from '../Profile/OrganizationProfile';

interface OrganizationEditPageProps {
  params: Promise<{ id: string }>;
}

export default function OrganizationEditPage({ params }: OrganizationEditPageProps) {
  const resolvedParams = use(params);
  const orgId = parseInt(resolvedParams.id);
  
  return <OrganizationProfile organizationId={orgId} />;
}
