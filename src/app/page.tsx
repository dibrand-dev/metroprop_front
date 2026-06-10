import Home from '@/components/Home/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function Page() {
    return <Home />;
}
