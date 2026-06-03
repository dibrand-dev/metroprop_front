import TopNavBar from '@/layout/ProfessionalUser/TopNavBar/TopNavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leads | MetroProp',
  description: 'Administra los leads del sitio',
};

export default function LeadsLayout({
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
