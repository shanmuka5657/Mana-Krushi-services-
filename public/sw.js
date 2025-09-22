// Choose a cache name
const cacheName = 'mana-krushi-cache-v1';

// List the files to cache
// IMPORTANT: Add all essential pages and assets here
const filesToCache = [
  '/',
  '/offline',
  '/login',
  '/signup',
  // Add other important assets like CSS, JS, and key images
  '/favicon.ico', // Example
  // The manifest itself should be cached
  '/manifest.json'
];

// When the service worker is installed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        // Cache all the specified files
        return cache.addAll(filesToCache);
      })
  );
});

// When the app fetches a resource
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the resource is in the cache, serve it
        if (response) {
          return response;
        }

        // If not, try to fetch it from the network
        return fetch(event.request).catch(() => {
          // If the network request fails (e.g., offline),
          // return the offline fallback page for navigation requests.
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});
