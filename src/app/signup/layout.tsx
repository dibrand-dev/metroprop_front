import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta | MetroProp",
  description: "Crea tu cuenta en MetroProp",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
