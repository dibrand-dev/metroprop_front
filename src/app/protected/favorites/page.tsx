import { Suspense } from 'react';
import Favorites from './Favorites/Favorites';
import Header from '@/layout/Header/Header';

export default function FavoritesPage() {
  return (
    <>
      <Suspense fallback={null}>
        <Favorites />
      </Suspense>
    </>
  );
}
