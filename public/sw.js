
// Service Worker - Basic cache-first strategy with logs for install and activate events

const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.js',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add any other important assets here
];

// Install Event: Cache assets on installation
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching files...');
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event: Clean up old caches if version changes
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME]; // Only keep the current cache

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Service Worker: Deleting outdated cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ensure the new service worker takes control immediately
});

// Fetch Event: Cache-first strategy for offline support
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('Service Worker: Returning cached response for', event.request.url);
        return cachedResponse;
      }

      console.log('Service Worker: Fetching from network', event.request.url);
      return fetch(event.request).then((networkResponse) => {
        // Cache the new resource for future use (optional)
        if (event.request.url.startsWith(self.location.origin)) { // Don't cache external resources
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
    })
  );
});
