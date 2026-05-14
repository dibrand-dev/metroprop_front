import TopNavBar from '@/layout/ProfessionalUser/TopNavBar/TopNavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organizaciones | MetroProp',
  description: 'Administra las organizaciones del sitio',
};

export default function OrganizationsLayout({
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
