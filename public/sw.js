// The version of the cache.
const VERSION = 'v1';

// The name of the cache
const CACHE_NAME = `mana-krushi-services-${VERSION}`;

// A list of essential files to be precached.
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png'
];

/**
 * The install event is fired when the service worker is first installed.
 * We use this event to pre-cache our essential assets.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

/**
 * The activate event is fired when the service worker is activated.
 * We use this event to clean up old caches and ensure the new service worker
 * takes control of the page.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/**
 * The fetch event is fired for every network request.
 * We use a "Network-first, falling back to cache" strategy.
 * For navigation requests, if the network fails, we show a custom offline page.
 */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        // 1. Try to fetch from the network
        const networkResponse = await fetch(event.request);
        
        // If the request is successful, update the cache and return the response
        if (event.request.method === 'GET') {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;

      } catch (error) {
        // 2. If the network fails, try to get it from the cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 3. For navigation requests, if both fail, show the offline fallback page
        if (event.request.mode === 'navigate') {
          const offlinePage = await cache.match('/offline.html');
          return offlinePage;
        }
        
        // For other requests, return a generic error response
        return new Response("Network error", {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })
  );
});

/**
 * The push event is fired when a push notification is received.
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
  const { title, body, icon, badge } = data;
  
  const options = {
    body: body,
    icon: icon || '/assets/icons/icon-192x192.png',
    badge: badge || '/assets/icons/icon-96x96.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * The notificationclick event is fired when a user clicks on a notification.
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

/**
 * The sync event is fired for background sync operations.
 * This is useful for deferring actions until the user has a stable connection.
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      console.log("Background sync in progress...")
      // In a real app, you would put your data synchronization logic here.
      // For example: sending form data that was submitted offline.
    );
  }
});


/**
 * The periodicsync event is fired for periodic background sync operations.
 * This allows the app to fetch fresh content periodically.
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-routes') {
    event.waitUntil(
        console.log("Fetching latest routes periodically...")
      // In a real app, you would fetch new data and update the cache.
      // For example: fetch('/api/latest-routes').then(response => response.json()).then(data => cache.put(...))
    );
  }
});
