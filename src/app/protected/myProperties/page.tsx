import Footer from '@/layout/Footer/Footer';
import Header from '@/layout/Header/Header';
import MyProperties from './myProperties/MyProperties';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: "Metroprop",
  description: "Mis publicaciones | MetroProp",
};

export default function Page() {
  return <>
    <Suspense fallback={null}>
      <MyProperties />
    </Suspense>
  </>;
}