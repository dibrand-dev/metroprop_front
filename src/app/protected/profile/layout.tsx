import TopNavBar from "@/layout/ProfessionalUser/TopNavBar/TopNavBar";
import type { Metadata } from "next";
import './layout.scss';

export const metadata: Metadata = {
  title: "Datos de Perfil | MetroProp",
  description: "Administra los datos de tu perfil",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
    <TopNavBar />
    {children}
  </>  
}
