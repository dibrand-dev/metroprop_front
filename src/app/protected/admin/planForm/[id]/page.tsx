import PlanForm from '../PlanForm/PlanForm';

interface PlanFormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlanFormEditPage({ params }: PlanFormEditPageProps) {
  const resolvedParams = await params;
  return <PlanForm planId={resolvedParams.id} />;
}
