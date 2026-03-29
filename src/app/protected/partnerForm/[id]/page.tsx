import PartnerForm from '../PartnerForm/PartnerForm';

interface PartnerFormEditPageProps {
  params: { id: string };
}

export default function PartnerFormEditPage({ params }: PartnerFormEditPageProps) {
  return <PartnerForm partnerId={params.id} />;
}
