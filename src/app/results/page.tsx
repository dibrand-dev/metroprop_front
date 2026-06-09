import { Suspense } from 'react';
import Results from '@/app/results/Results/Results';
import Header from '@/layout/Header/Header';

export default function ResultsPage() {
  return (
    <>
      <Header showFilter={true} />
      <Suspense fallback={null}>
        <Results />
      </Suspense>
    </>
  );
}
