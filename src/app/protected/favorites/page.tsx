import { Suspense } from 'react';
import Favorites from './Favorites/Favorites';
import Header from '@/layout/User/Header/Header';

export default function FavoritesPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Favorites />
      </Suspense>
    </>
  );
}
