import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "¿Olvidaste tu contraseña? | MetroProp",
  description: "Ingresa tu correo electrónico para recibir instrucciones para restablecer tu contraseña en MetroProp",
};

export default function ForgotPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} ${montserrat.className}`}>
        {children}
      </body>
    </html>
  );
}
