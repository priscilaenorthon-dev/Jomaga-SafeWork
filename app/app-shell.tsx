'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from 'sonner';

const PUBLIC_ROUTES = ['/login', '/auth'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  if (isPublic) {
    return (
      <>
        {children}
        <Toaster position="top-right" richColors />
      </>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
