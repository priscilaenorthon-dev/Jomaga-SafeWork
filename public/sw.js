const CACHE_NAME = 'safework-v2';
const PRECACHE_URLS = [
  '/',
  '/login',
  '/manifest.json',
  '/offline.html',
  '/icon',
  '/icon-192.png',
  '/icon-512.png',
];

const isSameOrigin = (requestUrl) => {
  const url = new URL(requestUrl);
  return url.origin === self.location.origin;
};

const isStaticAsset = (pathname) => {
  return pathname.startsWith('/_next/static') || /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?)$/i.test(pathname);
};

const putInCache = async (request, response) => {
  if (!response || response.status !== 200) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET' || !isSameOrigin(request.url)) return;

  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(request);
        await putInCache(request, networkResponse);
        return networkResponse;
      } catch {
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;
        return (await caches.match('/offline.html')) || Response.error();
      }
    })());
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      if (cached) return cached;

      try {
        const networkResponse = await fetch(request);
        await putInCache(request, networkResponse);
        return networkResponse;
      } catch {
        return cached || Response.error();
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);

    const networkPromise = fetch(request)
      .then(async (networkResponse) => {
        await putInCache(request, networkResponse);
        return networkResponse;
      })
      .catch(async () => {
        if (cached) return cached;
        if (request.destination === 'document') {
          return (await caches.match('/offline.html')) || Response.error();
        }
        return Response.error();
      });

    return cached || networkPromise;
  })());
});
