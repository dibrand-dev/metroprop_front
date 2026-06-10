import { Suspense } from 'react';
import Favorites from './Favorites/Favorites';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Favoritos",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};


export default function FavoritesPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Favorites />
      </Suspense>
    </>
  );
}
