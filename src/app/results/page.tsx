import { Suspense } from 'react';
import Results from '@/app/results/Results/Results';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Resultados de búsqueda",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function ResultsPage() {
  return (
    <Suspense fallback={null}>
      <Results />
    </Suspense>
  );
}
