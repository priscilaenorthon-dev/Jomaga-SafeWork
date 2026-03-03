import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import DashboardLayout from './dashboard-layout';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Jomaga SafeWork',
  description: 'Sistema de gestão de segurança industrial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </body>
    </html>
  );
}
