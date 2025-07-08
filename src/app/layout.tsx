import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
        {children}
      </body>
    </html>
  );
}

