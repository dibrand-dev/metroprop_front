import PropertyLeads from './PropertyLeads';

interface PropertyLeadsPageProps {
  params: { id: string };
}

export default function PropertyLeadsPage({ params }: PropertyLeadsPageProps) {
  return <PropertyLeads propertyId={Number(params.id)} />;
}
