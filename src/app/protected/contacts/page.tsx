import { Suspense } from 'react';
import Contacts from './Contacts/Contacts';
import Header from '@/layout/Header/Header';

export default function ContactsPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Contacts />
      </Suspense>
    </>
  );
}
