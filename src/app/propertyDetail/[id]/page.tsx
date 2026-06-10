import PropertyDetail from '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Detalle de propiedad",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  return <PropertyDetail propertyId={params.id} />;
}
