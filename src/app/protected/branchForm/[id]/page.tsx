import BranchForm from '@/components/BranchForm/BranchForm';

interface BranchFormEditPageProps {
  params: { id: string };
}

export default function BranchFormEditPage({ params }: BranchFormEditPageProps) {
  return <BranchForm branchId={params.id} />;
}
