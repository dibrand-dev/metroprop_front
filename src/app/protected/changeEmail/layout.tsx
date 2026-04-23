import TopNavBar from "@/layout/ProfessionalUser/TopNavBar/TopNavBar";
import type { Metadata } from "next";
import './layout.scss';

export const metadata: Metadata = {
  title: "Cambiar Email | MetroProp",
  description: "Administra tu cuenta",
};

export default function ChangeEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>
    <TopNavBar />
    {children}    
  </>  
}
