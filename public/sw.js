// A simple, no-op service worker that immediately activates.
// This is the simplest possible service worker that will allow your app to be installed.

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/globals.css',
  // Add other static assets you want to cache
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim clients immediately, so that the page will be controlled by this service worker.
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Always try the network first.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is likely a network error.
          // If fetch() returns a valid HTTP response with a 4xx or 5xx status, the catch() block will NOT be executed.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline');
          return cachedResponse;
        }
      })()
    );
  }
});
