import TopNavBar from '@/layout/ProfessionalUser/TopNavBar/TopNavBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner | MetroProp',
  description: 'Administra un partner de tu inmobiliaria',
};

export default function PartnerFormLayout({
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
