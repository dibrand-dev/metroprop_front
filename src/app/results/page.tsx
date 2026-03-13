import { Suspense } from 'react';
import Results from '@/app/results/Results/Results';
import Header from '@/layout/User/Header/Header';

export default function ResultsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <Results />
      </Suspense>
    </>
  );
}
