import BranchForm from '@/app/protected/admin/branchForm/BranchForm/BranchForm';

interface BranchFormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function BranchFormEditPage({ params }: BranchFormEditPageProps) {
  const resolvedParams = await params;
  return <BranchForm branchId={resolvedParams.id} />;
}
