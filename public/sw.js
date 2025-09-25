// Define a unique cache name for this version of the service worker.
const CACHE_NAME = 'mana-krushi-cache-v1';

// List of essential assets to cache during installation.
const URLS_TO_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/styles/globals.css' // Assuming you have a main stylesheet
];

// --- 1. INSTALL Event: Caching the App Shell ---
// This event fires when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell', error);
      })
  );
});

// --- 2. ACTIVATE Event: Cleaning Up Old Caches ---
// This event fires after installation and when the service worker becomes active.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// --- 3. FETCH Event: Serving Content (Offline-First) ---
// This event fires for every network request made by the app.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the resource is in the cache, return it.
        if (cachedResponse) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If the resource is not in the cache, fetch it from the network.
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          (networkResponse) => {
            // If the fetch is successful, clone the response and cache it for next time.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return networkResponse;
          }
        ).catch((error) => {
          // If the network fetch fails (e.g., user is offline) and it's a page navigation...
          console.log('Service Worker: Fetch failed; returning offline page.', error);
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          // For non-navigation requests (like images, API calls), just fail.
          // You could return placeholder images here if you wanted.
        });
      })
  );
});


// --- 4. PUSH Event: Handling Push Notifications ---
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  if (!event.data) {
    console.error('Service Worker: Push event but no data');
    return;
  }
  const data = event.data.json();
  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// --- 5. NOTIFICATION CLICK Event: Handling Notification Clicks ---
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});


// --- 6. BACKGROUND SYNC & PERIODIC SYNC Events ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-example') {
    console.log('Service Worker: Background sync event triggered!');
    event.waitUntil(
        // Here you would perform the background task, e.g., sending data to a server.
        new Promise((resolve, reject) => {
            console.log("Simulating background data sync...");
            setTimeout(resolve, 2000);
        })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync-example') {
    console.log('Service Worker: Periodic sync event triggered!');
    event.waitUntil(
        // Here you would perform the periodic task, e.g., fetching fresh data.
         new Promise((resolve, reject) => {
            console.log("Simulating periodic data fetch...");
            setTimeout(resolve, 2000);
        })
    );
  }
});
