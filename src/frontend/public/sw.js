const CACHE_NAME = 'save-shop-v221';
const APP_SHELL = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  // Skip waiting immediately so new SW takes over without delay
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
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

// Message handler: SKIP_WAITING and GET_VERSION
self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'GET_VERSION') {
    if (event.source) {
      event.source.postMessage({ type: 'VERSION', version: CACHE_NAME });
    }
  }
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Network-first for index.html — always fetch fresh HTML
  // Only fall back to cache if network fails
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/index.html' ||
    url.pathname === '/'
  ) {
    event.respondWith(
      fetch(event.request).then((response) => {
        // SPA fallback: if navigation gets a 404, serve fresh /index.html
        if (response.status === 404 || !response.ok) {
          return fetch('/index.html');
        }
        return response;
      }).catch(() => {
        // Network failure — fall back to cached index.html for offline support
        return caches.match('/index.html').then((fallback) => {
          return fallback ?? new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Cache-first for all other same-origin requests (JS, CSS, images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
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
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
