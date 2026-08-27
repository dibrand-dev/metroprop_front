import { notFound, redirect } from 'next/navigation';
import PropertyDetail from '@/app/propertyDetail/[id]/PropertyDetail/PropertyDetail';
import { parsePropertySlug } from '@/utils/utils';
import { Metadata } from 'next';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const propertyId = parsePropertySlug(resolvedParams.slug);
  
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

export default async function SlugPage({ params }: SlugPageProps) {
  const resolvedParams = await params;
  // Parse the slug to extract property ID
  const propertyId = parsePropertySlug(resolvedParams.slug);

  // If slug doesn't match property pattern, return 404
  if (!propertyId) {
    notFound();
  }

  // Render the same PropertyDetail component used by the old route
  return <PropertyDetail propertyId={propertyId.toString()} />;
}
