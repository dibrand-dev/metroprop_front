import PropertyDetail from '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail';
import QueryProvider from '@/providers/QueryProvider';

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return <QueryProvider><PropertyDetail propertyId={params.id} /></QueryProvider>;
}
