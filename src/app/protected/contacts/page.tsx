import { Suspense } from 'react';
import Contacts from './Contacts/Contacts';
import Header from '@/layout/User/Header/Header';

export default function ContactsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Contacts />
      </Suspense>
    </>
  );
}
