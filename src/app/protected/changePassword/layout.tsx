import TopNavBar from "@/layout/ProfessionalUser/TopNavBar/TopNavBar";
import type { Metadata } from "next";
import './layout.scss';

export const metadata: Metadata = {
  title: "Cambiar Contraseña | MetroProp",
  description: "Administra tu cuenta",
};

export default function ChangePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
    <TopNavBar />
    {children}    
  </>  
}
