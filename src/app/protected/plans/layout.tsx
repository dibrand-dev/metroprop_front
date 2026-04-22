import TopNavBar from '@/layout/ProfessionalUser/TopNavBar/TopNavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plans | MetroProp',
  description: 'Administra los planes',
};

export default function PlansLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopNavBar />
      {children}
    </>
  );
}
