import CollaboratorForm from '../CollaboratorForm/CollaboratorForm';

interface CollaboratorFormEditPageProps {
  params: { id: string };
}

export default function CollaboratorFormEditPage({ params }: CollaboratorFormEditPageProps) {
  return <CollaboratorForm collaboratorId={params.id} />;
}
