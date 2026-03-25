import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Signup - Metroprop",
  description: "Profesional Signup for Metroprop",
};

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children
}
