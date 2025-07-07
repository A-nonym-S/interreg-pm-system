import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "INTERREG HUSKROUA - Project Management",
  description: "Komplexný systém pre riadenie projektu INTERREG HUSKROUA s AI-powered automatizáciou a compliance monitoringom",
  keywords: ["INTERREG", "HUSKROUA", "project management", "EU", "compliance"],
  authors: [{ name: "INTERREG HUSKROUA Team" }],
  openGraph: {
    title: "INTERREG HUSKROUA - Project Management",
    description: "Komplexný systém pre riadenie projektu INTERREG HUSKROUA",
    type: "website",
    locale: "sk_SK",
  },
  robots: {
    index: false, // Internal tool
    follow: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sk" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0A0A0B" />
      </head>
      <body className={cn(
        inter.variable,
        "min-h-screen bg-dark-bg-primary text-dark-text-primary antialiased",
        "selection:bg-brand-primary/20 selection:text-brand-primary"
      )}>
        <div id="root" className="relative">
          {children}
        </div>
        
        {/* Portal for modals and toasts */}
        <div id="portal-root" />
        
        {/* Background Grid */}
        <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      </body>
    </html>
  );
}

