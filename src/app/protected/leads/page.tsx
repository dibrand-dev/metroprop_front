import Leads from "./Leads/Leads";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Interesados en mis propiedades",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function LeadsPage() {
  return <Leads />;
}
