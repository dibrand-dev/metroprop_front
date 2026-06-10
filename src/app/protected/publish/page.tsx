import Publish from '@/app/protected/publish/Publish/Publish';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Publicar propiedad",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function PublishPage() {
  return <Publish />;
}
