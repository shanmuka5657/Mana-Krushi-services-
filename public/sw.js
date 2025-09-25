// This is a basic service worker file.

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/globals.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event: Fires when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // waitUntil() ensures that the service worker will not install until the code inside has successfully completed.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Skip waiting to activate the new service worker immediately.
        return self.skipWaiting();
      })
  );
});

// Activate event: Fires when the service worker is activated.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Clean up old caches.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
        // Claim clients to ensure the new service worker takes control of the page immediately.
        return self.clients.claim();
    })
  );
});

// Fetch event: Fires for every network request.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests, use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // If the network fails, serve the offline page from the cache.
          return caches.match('/offline');
        })
    );
    return;
  }

  // For other requests (CSS, JS, images), use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we found a match in the cache, return it.
        if (response) {
          return response;
        }
        // Otherwise, fetch from the network.
        return fetch(event.request)
          .then((networkResponse) => {
            // Optional: Cache the new resource for future use.
            // Be careful with what you cache dynamically.
            return networkResponse;
          });
      })
  );
});


// --- BACKGROUND SYNC ---
// This event is fired when the browser regains connectivity.
// It's used to send data that was queued while the app was offline.
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event received', event.tag);
  if (event.tag === 'sync-offline-submissions') {
    event.waitUntil(
      console.log('Placeholder for sending offline form submissions.')
      // Example: sendOfflineSubmissions();
    );
  }
});


// --- PERIODIC BACKGROUND SYNC ---
// This event is fired periodically by the browser to allow the PWA
// to fetch fresh content in the background.
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync event received', event.tag);
  if (event.tag === 'get-latest-data') {
    event.waitUntil(
       console.log('Placeholder for fetching latest data, e.g., new routes or bookings.')
       // Example: fetchAndCacheLatestNews();
    );
  }
});

// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', event => {
  console.log('Push notification received', event);
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
