import PlanForm from '../AdsForm/AdsForm';

interface PlanFormEditPageProps {
  params: { id: string };
}

export default function PlanFormEditPage({ params }: PlanFormEditPageProps) {
  return <PlanForm planId={params.id} />;
}
