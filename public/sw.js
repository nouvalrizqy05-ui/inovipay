const CACHE_NAME = 'inovipay-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Jangan cache API requests
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  // Network-first strategy: selalu ambil dari server dulu
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Hanya kalau offline, coba ambil dari cache
        return caches.match(event.request);
      })
  );
});
