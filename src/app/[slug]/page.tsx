import { notFound, redirect } from 'next/navigation';
import PropertyDetail from '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail';
import { parsePropertySlug } from '@/utils/utils';
import { Metadata } from 'next';

interface SlugPageProps {
  params: { slug: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const propertyId = parsePropertySlug(params.slug);
  
  if (!propertyId) {
    return {
      title: 'Propiedad no encontrada - Metroprop',
      description: 'La propiedad que buscas no está disponible.',
    };
  }

  // You can fetch property data here to generate dynamic metadata
  // For now, return generic metadata
  return {
    title: `Propiedad ${propertyId} - Metroprop`,
    description: 'Encuentra tu próxima propiedad en Metroprop - Tu plataforma inmobiliaria de confianza.',
  };
}

export default function SlugPage({ params }: SlugPageProps) {
  // Parse the slug to extract property ID
  const propertyId = parsePropertySlug(params.slug);

  // If slug doesn't match property pattern, return 404
  if (!propertyId) {
    notFound();
  }

  // Render the same PropertyDetail component used by the old route
  return <PropertyDetail propertyId={propertyId.toString()} />;
}
