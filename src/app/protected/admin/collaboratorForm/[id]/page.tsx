import CollaboratorForm from '../CollaboratorForm/CollaboratorForm';

interface CollaboratorFormEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function CollaboratorFormEditPage({ params }: CollaboratorFormEditPageProps) {
  const resolvedParams = await params;
  return <CollaboratorForm collaboratorId={resolvedParams.id} />;
}
