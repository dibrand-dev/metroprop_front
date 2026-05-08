"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/metropropLogo_mobile.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com"  />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
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
