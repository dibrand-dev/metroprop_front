import Publish from '@/app/protected/publish/Publish/Publish';

interface EditPublishPageProps {
  params: { id: string };
}

export default function EditPublishPage({ params }: EditPublishPageProps) {
  return <Publish propertyId={params.id} />;
}
