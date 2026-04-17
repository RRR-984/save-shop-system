const CACHE_NAME = 'fifo-bridge-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // SPA fallback: if navigation request gets a 404, serve /index.html
        if (
          event.request.mode === 'navigate' &&
          (response.status === 404 || !response.ok)
        ) {
          return caches.match('/index.html').then((fallback) => {
            if (fallback) return fallback;
            return fetch('/index.html');
          });
        }

        // Cache successful responses for same-origin requests
        if (
          response.ok &&
          event.request.url.startsWith(self.location.origin)
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Network failure — for navigation requests serve cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html').then((fallback) => {
            return fallback ?? new Response('Offline', { status: 503 });
          });
        }
        return cached ?? new Response('Offline', { status: 503 });
      });
    })
  );
});
