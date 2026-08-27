'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import './LayoutWrapper.scss';
import Header from './Header/Header';
import Footer from './Footer/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showFilter = pathname === '/results';
  return (
    <div className={`bodyContainer ${pathname.replace(/\//g, '-').replace(/^-/, '')}`}>
      <Suspense fallback={null}>
        <Header showFilter={showFilter}/>
      </Suspense>
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}