// Bump this when making UI/asset changes so clients get the updated SW/cache
const CACHE_NAME = 'modelforge-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET HTTP requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

  const acceptHeader = event.request.headers.get('Accept') || '';
  const isHTML = acceptHeader.includes('text/html') || event.request.mode === 'navigate';
  const isAsset = /\.(js|css|html|png|jpg|jpeg|svg|webp|woff2?)($|\?)/i.test(event.request.url);

  // Network-first for navigation/HTML and key assets so UI updates are fetched immediately.
  if (isHTML || isAsset) {
    event.respondWith(
      fetch(event.request).then(networkResponse => {
        // Cache a copy for offline fallback
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => {
        // On failure, try cache, else return a fallback
        return caches.match(event.request).then(cached => cached || new Response('You are offline and this page was not cached.', { status: 503 }));
      })
    );
    return;
  }

  // For other requests, fallback-to-network then cache (usual behavior)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      }).catch(() => new Response('You are offline and this resource was not cached.', { status: 503 }));
    })
  );
});
