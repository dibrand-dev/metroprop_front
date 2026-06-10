import MyProperties from './myProperties/MyProperties';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Metroprop - Mis publicaciones",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function Page() {
  return <>
    <Suspense fallback={null}>
      <MyProperties />
    </Suspense>
  </>;
}