import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar Contraseña | MetroProp",
  description: "Reestablece tu contraseña de MetroProp",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
