
const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Add other static assets that should be cached
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
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
            // If the fetch fails (e.g., user is offline), return the offline page.
            return caches.match('/offline');
        });
      })
  );
});


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
});

// Listener for periodic background sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-daily-news') {
    event.waitUntil(
        console.log("Periodic Sync: Mocking fetching daily news.")
    );
  }
});

// Listener for background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-posts') {
    event.waitUntil(
        console.log("Background Sync: Mocking syncing new posts.")
    );
  }
});
