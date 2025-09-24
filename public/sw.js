// A simple, robust, cache-first service worker.

const CACHE_NAME = 'mana-krushi-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/favicon.ico',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// On install, pre-cache the essential assets.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// On activation, take control of all clients and clean up old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim()
      .then(() => {
        // Clean up old caches
        return caches.keys().then((cacheNames) => {
          return Promise.all(
            cacheNames.filter((cacheName) => {
              return cacheName.startsWith('mana-krushi-cache-') && cacheName !== CACHE_NAME;
            }).map((cacheName) => {
              return caches.delete(cacheName);
            })
          );
        });
      })
  );
});

// On fetch, use a cache-first strategy.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      // 1. Check the cache for a matching request.
      return cache.match(event.request).then((cachedResponse) => {
        // Return the cached response if found.
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. If not in cache, fetch from the network.
        return fetch(event.request).then((networkResponse) => {
          // 2a. If the fetch is successful, clone it and cache it.
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          // Return the network response.
          return networkResponse;
        }).catch(() => {
          // 3. If the network fails, and it's a navigation request, return the offline fallback page.
          if (event.request.mode === 'navigate') {
            return cache.match('/offline.html');
          }
          // For other failed requests (e.g., images), return a generic error response.
          return new Response('Network error occurred.', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      });
    })
  );
});
