'use client';

import OrganizationProfile from '../Profile/OrganizationProfile';

export default function OrganizationEditPage({ params }: { params: { id: string } }) {
  const orgId = parseInt(params.id);
  
  return <OrganizationProfile organizationId={orgId} />;
}
