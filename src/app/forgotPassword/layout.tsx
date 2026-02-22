import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "¿Olvidaste tu contraseña? | MetroProp",
  description: "Ingresa tu correo electrónico para recibir instrucciones para restablecer tu contraseña en MetroProp",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}