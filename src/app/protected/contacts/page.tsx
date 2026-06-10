import { Suspense } from 'react';
import Contacts from './Contacts/Contacts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Contactos",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};


export default function ContactsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Contacts />
      </Suspense>
    </>
  );
}
