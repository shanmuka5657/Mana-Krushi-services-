const PRECACHE = 'precache-v2';
const RUNTIME = 'runtime';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  OFFLINE_URL,
  '/manifest.json',
  '/favicon.ico',
  '/globals.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Handle navigation requests (for pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first for navigation.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Catch is only triggered if the network fails.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(PRECACHE);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else if (PRECACHE_ASSETS.includes(event.request.url)) {
    // For precached assets, use a cache-first strategy.
     event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
  } else {
    // For all other requests, use a network-first, falling back to cache strategy.
    event.respondWith(
      caches.open(RUNTIME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // If the request is successful, clone it and store it in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          })
          .catch(() => {
            // If the network request fails, try to get it from the cache.
            return caches.match(event.request);
          });
      })
    );
  }
});
