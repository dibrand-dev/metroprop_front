"use client";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${montserrat.className}`}>
        <SessionProvider>
          <QueryProvider>
            {children}          
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
