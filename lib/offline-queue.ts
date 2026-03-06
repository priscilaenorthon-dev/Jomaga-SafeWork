'use client';

const OFFLINE_QUEUE_KEY = 'jomaga_offline_mutation_queue_v1';
export const OFFLINE_QUEUE_EVENT = 'offline-queue-updated';

export type OfflineMutationAction = 'insert' | 'upsert' | 'update' | 'delete';

type OfflineMutationMatch = {
  column: string;
  value: string;
};

export type OfflineMutationOperation = {
  table: string;
  action: OfflineMutationAction;
  payload?: any;
  match?: OfflineMutationMatch;
  onConflict?: string;
};

type OfflineMutationQueueItem = OfflineMutationOperation & {
  id: string;
  createdAt: string;
};

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
};

const dispatchQueueUpdate = (count: number) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OFFLINE_QUEUE_EVENT, { detail: { count } }));
};

const readQueue = (): OfflineMutationQueueItem[] => {
  const storage = getStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: OfflineMutationQueueItem[]) => {
  const storage = getStorage();
  if (!storage) return;

  storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  dispatchQueueUpdate(queue.length);
};

const enqueueOperation = (operation: OfflineMutationOperation) => {
  const queue = readQueue();
  const item: OfflineMutationQueueItem = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  queue.push(item);
  writeQueue(queue);

  return queue.length;
};

const isNetworkLikeError = (error: any) => {
  const message = String(error?.message || error || '').toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('offline') ||
    message.includes('timeout')
  );
};

const runOperation = async (supabase: any, operation: OfflineMutationOperation) => {
  if (!operation.table) return { message: 'Tabela inválida para sincronização offline.' };

  if (operation.action === 'insert') {
    const { error } = await supabase.from(operation.table).insert(operation.payload);
    return error;
  }

  if (operation.action === 'upsert') {
    const { error } = await supabase
      .from(operation.table)
      .upsert(operation.payload, operation.onConflict ? { onConflict: operation.onConflict } : undefined);
    return error;
  }

  if (!operation.match?.column || !operation.match?.value) {
    return { message: 'Filtro obrigatório ausente para operação offline.' };
  }

  if (operation.action === 'update') {
    const { error } = await supabase
      .from(operation.table)
      .update(operation.payload)
      .eq(operation.match.column, operation.match.value);
    return error;
  }

  const { error } = await supabase
    .from(operation.table)
    .delete()
    .eq(operation.match.column, operation.match.value);
  return error;
};

export const getOfflineQueueCount = () => readQueue().length;

export const executeMutationWithOfflineQueue = async ({
  supabase,
  operation,
}: {
  supabase: any;
  operation: OfflineMutationOperation;
}): Promise<{
  status: 'synced' | 'queued' | 'error';
  queueSize: number;
  error?: any;
}> => {
  if (typeof window === 'undefined') {
    const error = await runOperation(supabase, operation);
    if (error) return { status: 'error', queueSize: 0, error };
    return { status: 'synced', queueSize: 0 };
  }

  if (!navigator.onLine) {
    const queueSize = enqueueOperation(operation);
    return { status: 'queued', queueSize };
  }

  const error = await runOperation(supabase, operation);

  if (!error) {
    return { status: 'synced', queueSize: getOfflineQueueCount() };
  }

  if (isNetworkLikeError(error)) {
    const queueSize = enqueueOperation(operation);
    return { status: 'queued', queueSize };
  }

  return { status: 'error', queueSize: getOfflineQueueCount(), error };
};

export const flushOfflineQueue = async (supabase: any): Promise<{
  applied: number;
  pending: number;
  failed: boolean;
  errorMessage?: string;
}> => {
  const queue = readQueue();
  if (!queue.length) return { applied: 0, pending: 0, failed: false };

  const remaining: OfflineMutationQueueItem[] = [];
  let applied = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    const error = await runOperation(supabase, current);

    if (!error) {
      applied += 1;
      continue;
    }

    remaining.push(...queue.slice(index));

    if (isNetworkLikeError(error)) {
      writeQueue(remaining);
      return { applied, pending: remaining.length, failed: false };
    }

    writeQueue(remaining);
    return {
      applied,
      pending: remaining.length,
      failed: true,
      errorMessage: String(error?.message || 'Erro ao sincronizar fila offline.'),
    };
  }

  writeQueue([]);
  return { applied, pending: 0, failed: false };
};

export const setupOfflineQueueSync = (
  supabase: any,
  callbacks?: {
    onSynced?: (result: { applied: number; pending: number; failed: boolean }) => void;
    onSyncError?: (errorMessage: string) => void;
    onSyncStateChange?: (syncing: boolean) => void;
  }
) => {
  if (typeof window === 'undefined') return () => undefined;

  let syncing = false;

  const syncNow = async () => {
    if (syncing || !navigator.onLine) return;

    syncing = true;
    callbacks?.onSyncStateChange?.(true);

    const result = await flushOfflineQueue(supabase);

    if (result.applied > 0) {
      callbacks?.onSynced?.(result);
    }

    if (result.failed && result.errorMessage) {
      callbacks?.onSyncError?.(result.errorMessage);
    }

    syncing = false;
    callbacks?.onSyncStateChange?.(false);
  };

  const onlineHandler = () => {
    syncNow();
  };

  const focusHandler = () => {
    syncNow();
  };

  window.addEventListener('online', onlineHandler);
  window.addEventListener('focus', focusHandler);

  syncNow();

  return () => {
    window.removeEventListener('online', onlineHandler);
    window.removeEventListener('focus', focusHandler);
  };
};
