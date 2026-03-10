'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { Toaster, toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';
import { cn } from '@/lib/utils';
import { getOfflineQueueCount, OFFLINE_QUEUE_EVENT, setupOfflineQueueSync } from '@/lib/offline-queue';

const PUBLIC_ROUTES = ['/login', '/auth', '/assinatura'];
const DEFAULT_COMPANY_LOGO = '/icon-192.png';
const DEFAULT_COMPANY_NAME = 'SafeWork';

function normalizeCompanyName(value?: string | null) {
  const raw = typeof value === 'string' ? value.trim() : '';
  return raw || DEFAULT_COMPANY_NAME;
}

function updateDocumentTitle(companyName?: string | null) {
  if (typeof document === 'undefined') return;
  document.title = normalizeCompanyName(companyName);
}

function normalizeLogoUrl(value?: string | null) {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || raw === '/icon' || raw === '/icon-192.png' || raw === '/icon-512.png' || raw === '/logo-sistema.png' || raw === '/logo-modelos/safework-02-capacete-check.svg') return DEFAULT_COMPANY_LOGO;
  return raw;
}

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
        const saved = localStorage.getItem('jomaga_company_settings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            updateDocumentTitle(parsed?.companyName);
          } catch {
            updateDocumentTitle(DEFAULT_COMPANY_NAME);
          }
        } else {
          updateDocumentTitle(DEFAULT_COMPANY_NAME);
        }

        const { data } = await supabase
          .from('company_settings')
          .select('company_name, logo_url, cnpj')
          .eq('id', 1)
          .maybeSingle();

        if (!data) return;

        const merged = {
          companyName: normalizeCompanyName(data.company_name),
          companyLogo: normalizeLogoUrl(data.logo_url),
          cnpj: data.cnpj || '',
        };

        localStorage.setItem('jomaga_company_settings', JSON.stringify(merged));
        updateDocumentTitle(merged.companyName);
        window.dispatchEvent(new Event('company-settings-updated'));
      } catch {
        updateDocumentTitle(DEFAULT_COMPANY_NAME);
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

    const handleCompanySettingsUpdate = () => {
      try {
        const saved = localStorage.getItem('jomaga_company_settings');
        if (!saved) {
          updateDocumentTitle(DEFAULT_COMPANY_NAME);
          return;
        }

        const parsed = JSON.parse(saved);
        updateDocumentTitle(parsed?.companyName);
      } catch {
        updateDocumentTitle(DEFAULT_COMPANY_NAME);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener(OFFLINE_QUEUE_EVENT, handleQueueUpdate);
    window.addEventListener('company-settings-updated', handleCompanySettingsUpdate);

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
      window.removeEventListener('company-settings-updated', handleCompanySettingsUpdate);
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
