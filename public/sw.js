// Define a cache name
const CACHE_NAME = 'mana-krushi-cache-v1';

// List of files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/globals.css', // Assuming your CSS is critical
  // Add other critical assets like a logo if needed
  'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg' 
];

// 1. Install Event: Cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching all: app shell and content');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('[Service Worker] Failed to cache', error);
      })
  );
});

// 2. Fetch Event: Serve from cache or network, with offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          })
          .catch(() => {
            // Network request failed, user is offline
            // If it's a navigation request, show the offline page.
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            // For other requests (images, etc.), you can return a placeholder or nothing
            return undefined;
          });
      })
  );
});

// 3. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});


// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  const data = event.data.json();
  console.log('[Service Worker] Push data:', data);

  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg',
    badge: data.badge || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});

// --- BACKGROUND & PERIODIC SYNC ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-background-sync') {
    console.log('[Service Worker] Background sync event received');
    event.waitUntil(
      // Perform some background task, e.g., fetching data
      fetch('/api/sync-data').then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
        return response.json();
      }).then(data => {
        console.log('[Service Worker] Background sync data fetched:', data);
      }).catch(err => {
        console.error('[Service Worker] Background sync failed:', err);
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-periodic-sync') {
    console.log('[Service Worker] Periodic sync event received');
    event.waitUntil(
      // Perform some periodic background task
      console.log('[Service Worker] Performing a periodic task.')
    );
  }
});
