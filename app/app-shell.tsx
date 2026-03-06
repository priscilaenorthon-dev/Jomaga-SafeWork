'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toaster, toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { getOfflineQueueCount, OFFLINE_QUEUE_EVENT, setupOfflineQueueSync } from '@/lib/offline-queue';

const PUBLIC_ROUTES = ['/login', '/auth', '/assinatura'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const isPublic = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const [isOffline, setIsOffline] = useState(false);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [syncingQueue, setSyncingQueue] = useState(false);

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

    setIsOffline(!navigator.onLine);
    setPendingQueue(getOfflineQueueCount());

    const queueSyncCleanup = setupOfflineQueueSync(supabase, {
      onSynced: (result) => {
        setPendingQueue(result.pending);
        toast.success(`${result.applied} pendência(s) offline sincronizada(s).`);
      },
      onSyncError: (message) => {
        toast.error(`Falha na sincronização offline: ${message}`);
      },
      onSyncStateChange: (syncing) => {
        setSyncingQueue(syncing);
      },
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    const handleQueueUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === 'number') {
        setPendingQueue(detail.count);
      } else {
        setPendingQueue(getOfflineQueueCount());
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdate);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // silent fail for unsupported/blocked environments
      });
    }

    return () => {
      queueSyncCleanup();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdate);
    };
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
        {(isOffline || syncingQueue || pendingQueue > 0) && (
          <div className={cn(
            'px-4 py-2 text-xs font-semibold border-b',
            isOffline
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : syncingQueue
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          )}>
            {isOffline
              ? `Sem conexão. ${pendingQueue} pendência(s) aguardando sincronização.`
              : syncingQueue
                ? `Sincronizando dados offline (${pendingQueue} pendência(s) restantes)...`
                : `Conectado. ${pendingQueue} pendência(s) prontas para sincronizar.`}
          </div>
        )}
        {children}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
