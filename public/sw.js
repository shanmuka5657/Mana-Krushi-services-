// A basic service worker for PWA offline capabilities

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // If the network fails, and the request is for a page,
          // return the offline fallback page.
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// This will activate the new service worker immediately,
// instead of waiting for the user to close all tabs.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});
