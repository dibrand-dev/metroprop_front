import PropertyLeads from './PropertyLeads';

interface PropertyLeadsPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyLeadsPage({ params }: PropertyLeadsPageProps) {
  const resolvedParams = await params;
  return <PropertyLeads propertyId={Number(resolvedParams.id)} />;
}
