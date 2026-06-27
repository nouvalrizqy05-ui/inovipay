const CACHE_NAME = 'inovipay-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Hanya bypass (tidak ada caching agresif untuk PPOB yang butuh real-time data)
  // Tapi dengan adanya fetch event listener, browser mengizinkan "Add to Home Screen"
  event.respondWith(fetch(event.request));
});
