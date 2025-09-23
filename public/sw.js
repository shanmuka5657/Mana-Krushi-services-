
const CACHE_NAME = 'mana-krushi-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to ensure the new service worker activates immediately.
        return self.skipWaiting();
      })
  );
});

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
    }).then(() => {
      // Claim clients to take control of the page immediately.
      return self.clients.claim();
    })
  );
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

          // Always try the network first for navigation.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which happens
          // when there's a network error.
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline');
          return cachedResponse;
        }
      })()
    );
  } else if (urlsToCache.includes(new URL(event.request.url).pathname)) {
      // For other assets, use a cache-first strategy
      event.respondWith(
          caches.match(event.request).then((response) => {
              return response || fetch(event.request);
          })
      );
  }
});


// --- Push Notification Handler ---
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Mana Krushi', body: 'New notification!' };
  const { title, body, icon, data: notificationData } = data;
  
  const options = {
    body,
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: notificationData,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- Notification Click Handler ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus().then(c => c.navigate(urlToOpen));
      }
      return clients.openWindow(urlToOpen);
    })
  );
});


// --- Background Sync Handler ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Placeholder for a function that sends pending data to the server
      console.log("Background sync event triggered for 'sync-data'.")
    );
  }
});


// --- Periodic Sync Handler ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-content') {
    event.waitUntil(
      // Placeholder for a function that fetches fresh content from the server
      console.log("Periodic sync event triggered for 'get-latest-content'.")
    );
  }
});
