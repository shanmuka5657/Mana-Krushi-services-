
const CACHE_NAME = 'mana-krushi-cache-v1';

// These are the files that will be cached on install.
const urlsToCache = [
  '/',
  '/offline',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg' // Cache the actual logo
];

// Install the service worker and cache the essential app assets.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Failed to open cache: ', err);
      })
  );
});


// Activate the service worker, remove old caches.
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

// Intercept network requests and serve from cache if available.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response from cache.
        if (response) {
          return response;
        }

        // Not in cache - fetch from network.
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If the network request fails, and it's a navigation request,
          // serve the offline page.
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// Placeholder for periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-data') {
    event.waitUntil(
      console.log("Periodic Sync: Fetching latest data (placeholder)...")
    );
  }
});

// Placeholder for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-data') {
    event.waitUntil(
      console.log("Background Sync: Syncing new data (placeholder)...")
    );
  }
});
