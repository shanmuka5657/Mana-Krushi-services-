
// This is a basic service worker with a cache-first strategy.
const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  // Add other important pages and assets here
];

self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // The 'urlsToCache' is a placeholder. 
        // next-pwa will automatically generate a more comprehensive list of assets to cache.
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

        return fetch(event.request).then(
          response => {
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
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // If the fetch fails (e.g., user is offline), return the offline page.
        return caches.match('/offline');
      })
  );
});

// Background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-booking') {
    console.log('Service Worker: Background syncing new booking.');
    event.waitUntil(
      // Here you would typically re-try a failed API request
      // For now, we'll just log it.
      Promise.resolve() 
    );
  }
});


// Periodic Sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-rides') {
     console.log('Service Worker: Periodically fetching latest rides.');
    event.waitUntil(
      // This would fetch new data and update the cache
      Promise.resolve()
    );
  }
});


// Push Notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Service Worker: Push Received.', data);

  const title = data.title || 'Mana Krushi';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    ...data.options,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
