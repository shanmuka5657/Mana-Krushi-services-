// v1 - Service Worker

const CACHE_NAME = 'mana-krushi-services-cache-v1';
const OFFLINE_URL = '/offline';

// URLs to cache on install
const URLS_TO_CACHE = [
  '/',
  OFFLINE_URL,
  '/styles/globals.css', // Adjust if your global CSS path is different
  // Add other critical assets like logo, main scripts etc.
  '/manifest.json', 
];

// Install event: cache the application shell and critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: serve from cache, fallback to network, then to offline page
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests, use a network-first strategy then fallback to offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then((cache) => {
              return cache.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // For all other requests (CSS, JS, images), use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, and cache it for next time
        return fetch(event.request).then(
          (networkResponse) => {
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
          }
        );
      })
  );
});


// --- PUSH NOTIFICATION ---
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  const pushData = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };

  const title = pushData.title;
  const options = {
    body: pushData.body,
    icon: '/images/icons/icon-192x192.png', // Make sure you have this icon
    badge: '/images/icons/icon-72x72.png', // Make sure you have this icon
    data: {
      url: pushData.url || '/'
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});


// --- BACKGROUND SYNC & PERIODIC SYNC ---
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Sync event triggered:', event.tag);
  if (event.tag === 'my-background-sync') {
    event.waitUntil(
      // Perform some background task, e.g., fetching data
      console.log('Performing a background sync task.')
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic Sync event triggered:', event.tag);
  if (event.tag === 'my-periodic-sync') {
    event.waitUntil(
       // Perform a periodic background task
       console.log('Performing a periodic sync task.')
    );
  }
});
