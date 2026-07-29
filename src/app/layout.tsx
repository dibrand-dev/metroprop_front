"use client";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.scss";
import QueryProvider from "../providers/QueryProvider";
import { SessionProvider } from "next-auth/react";
import LayoutWrapper from "@/layout/LayoutWrapper";
import GTMPageviewTracker from "@/components/GTMPageviewTracker/GTMPageviewTracker";

const inter = Inter({ subsets: ["latin"], display: 'swap', variable: '--font-inter' });

const GTM_ID = process.env.NEXT_PUBLIC_GTM_CONTAINER_ID ?? "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        {GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        )}
        {/* End Google Tag Manager */}
        <link rel="icon" href="/images/metropropLogo_mobile.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com"  />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.className}`}>
        {/* Google Tag Manager (noscript) */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
        )}
        {/* End Google Tag Manager (noscript) */}
        <SessionProvider>
          <QueryProvider>
            <Suspense fallback={null}>
              <GTMPageviewTracker />
            </Suspense>
            <LayoutWrapper>{children}</LayoutWrapper>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}