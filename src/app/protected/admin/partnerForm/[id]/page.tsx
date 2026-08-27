import PartnerForm from '../PartnerForm/PartnerForm';

interface PartnerFormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PartnerFormEditPage({ params }: PartnerFormEditPageProps) {
  const resolvedParams = await params;
  return <PartnerForm partnerId={resolvedParams.id} />;
}
