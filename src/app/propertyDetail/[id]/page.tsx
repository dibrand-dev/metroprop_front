import PropertyDetail from '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail';

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return <PropertyDetail propertyId={params.id} />;
}
