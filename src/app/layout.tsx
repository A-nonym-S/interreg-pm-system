import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/header';
import { EUFooter } from '@/components/dashboard/eu-footer';

const inter = Inter({ subsets: ['latin', 'latin-ext'] });

export const metadata: Metadata = {
  title: 'INTERREG HUSKROUA Project Management System',
  description: 'Centralizovaný systém pre riadenie projektov INTERREG HUSKROUA s AI-powered klasifikáciou úloh a compliance monitoringom',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sk" className="dark">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto py-6">
              {children}
            </div>
          </main>
          <footer className="container mx-auto">
            <EUFooter />
          </footer>
        </div>
      </body>
    </html>
  );
}

