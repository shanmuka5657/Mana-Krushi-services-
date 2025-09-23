// public/sw.js

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  // Add other critical assets like CSS, JS, and key images/icons here
  // Example: '/styles/globals.css', '/app.js', '/logo.png'
];

// 1. Install Event: Cache essential assets for offline support
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event: Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // If fetch fails (offline), return the offline fallback page
          return caches.match('/offline');
        });
      })
    );
});

// 3. Activate Event: Clean up old caches
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

// 4. Push Notification Event: Handle incoming push messages
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png', // Ensure you have this icon
    badge: '/icons/icon-96x96.png' // And this one
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 5. Background Sync Event: For deferring actions until connection is restored
self.addEventListener('sync', event => {
  if (event.tag === 'send-report') {
    event.waitUntil(
        // Here you would typically read from IndexedDB and send to the server
        console.log('Background sync: sending report...')
        // sendReportsToServer().then(() => console.log('Reports sent'))
    );
  }
});

// 6. Periodic Sync Event: For regular background updates
self.addEventListener('periodicsync', event => {
    if (event.tag === 'get-latest-routes') {
        event.waitUntil(
            // Here you would fetch latest data and update the cache
            console.log('Periodic sync: fetching latest routes...')
            // fetchLatestRoutesAndUpdateCache()
        );
    }
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
