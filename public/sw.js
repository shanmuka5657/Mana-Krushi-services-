// A basic service worker for caching assets and enabling offline functionality.

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/login',
  '/signup',
  '/offline',
  '/styles/globals.css', // Adjust if your CSS paths are different
  // Add other critical assets like your logo or key scripts if they aren't dynamically loaded
  'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg' 
];

// Install event: opens a cache and adds the core assets to it.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event: serves assets from cache if available, otherwise fetches from network.
// It provides a fallback to an offline page for navigation requests that fail.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request to use it both for the cache and for the network.
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response to put it in the cache.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If the fetch fails (i.e., user is offline) and it's a navigation request,
        // show the offline fallback page.
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      })
  );
});

// Activate event: cleans up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
