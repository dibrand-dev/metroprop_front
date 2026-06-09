'use client';

import { usePathname } from 'next/navigation';
import styles from './LayoutWrapper.scss';
import Header from './Header/Header';
import Footer from './Footer/Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className={`bodyContainer ${pathname.replace(/\//g, '-').replace(/^-/, '')}`}>
      <Header className={styles.header}/>
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
}