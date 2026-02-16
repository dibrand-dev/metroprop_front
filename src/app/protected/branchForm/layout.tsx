import TopNavBar from '@/layout/ProfessionalUser/TopNavBar/TopNavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sucursal | MetroProp',
  description: 'Administra una sucursal de tu inmobiliaria',
};

export default function BranchFormLayout({
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
