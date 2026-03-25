import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Iniciar sesión - Metroprop",
  description: "Inicia sesión en tu cuenta de Metroprop",
};

export default function SigninLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children
}
