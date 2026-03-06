'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toaster } from 'sonner';
import { createClient } from '@/lib/supabase-client';

const PUBLIC_ROUTES = ['/login', '/auth', '/assinatura'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  useEffect(() => {
    if (isPublic || typeof window === 'undefined') return;

    const syncCompanySettings = async () => {
      try {
        const { data } = await supabase
          .from('company_settings')
          .select('company_name, logo_url')
          .eq('id', 1)
          .maybeSingle();

        if (!data) return;

        const merged = {
          companyName: data.company_name || 'SafeWork',
          companyLogo: data.logo_url || '/icon',
        };

        localStorage.setItem('jomaga_company_settings', JSON.stringify(merged));
        window.dispatchEvent(new Event('company-settings-updated'));
      } catch {
        // keep local settings if db fetch is not available
      }
    };

    syncCompanySettings();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // silent fail for unsupported/blocked environments
      });
    }
  }, [isPublic, supabase]);

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
