import Alerts from "./Alerts/Alerts";
import { Suspense } from "react";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Metroprop - Alertas",
  description: "Metroprop - Tu plataforma inmobiliaria de confianza. Encuentra, publica y gestiona propiedades con facilidad. ¡Únete a la comunidad Metroprop hoy mismo!",
};

export default function AlertsPage() {
  return <>
      <Suspense fallback={null}>
        <Alerts />
      </Suspense>
    </>;
}
