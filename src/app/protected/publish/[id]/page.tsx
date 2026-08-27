import Publish from '@/app/protected/publish/Publish/Publish';

interface EditPublishPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPublishPage({ params }: EditPublishPageProps) {
  const resolvedParams = await params;
  return <Publish propertyId={resolvedParams.id} />;
}
