import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import AppShell from './app-shell';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SafeWork',
  description: 'Sistema de gestão de segurança industrial',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
    shortcut: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SafeWork',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'msapplication-TileColor': '#1A237E',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${manrope.variable}`}>
      <head>
        <meta name="theme-color" content="#1A237E" />
        <link rel="icon" href="/icon-192.png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
