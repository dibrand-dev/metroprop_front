"use client";
import { Inter } from "next/font/google";
import "../../globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <SessionProvider>
          <QueryProvider>
            {children}          
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}