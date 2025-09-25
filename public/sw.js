// This is the service worker script which executes in the background,
// separate from the web page, to provide features like push notifications and offline support.

const CACHE_NAME = 'mana-krushi-cache-v1';

// A list of all the files and assets we want to cache.
// This is updated automatically during the build process.
const urlsToCache = [
  '/',
  '/offline',
  '/favicon.ico',
  '/manifest.json',
  '/styles/globals.css', // Adjust path based on your project structure
  // Add other critical assets like logo, main scripts etc.
  'https://i.ibb.co/6Rrvs6tM/Whats-App-Image-2025-09-20-at-13-02-57-9dc142ff.png'
];

// --- EVENT LISTENERS ---

// 1. Install Event:
// This is fired when the service worker is first installed.
// We open a cache and add all the core app shell files to it.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting(); // Force the waiting service worker to become the active one.
      })
  );
});

// 2. Activate Event:
// This is fired when the service worker is activated.
// We clean up any old caches that are no longer needed.
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
        console.log('Service Worker: Activation complete');
        return self.clients.claim(); // Take control of the page immediately.
    })
  );
});

// 3. Fetch Event:
// This is fired for every network request made by the page.
// We try to serve the request from the cache first for offline support.
self.addEventListener('fetch', (event) => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If we found a match in the cache, return it.
        if (response) {
          return response;
        }

        // If no match, we fetch it from the network.
        return fetch(event.request)
          .then((response) => {
            // We can also cache the new request here for future offline use.
            // But for now, we'll keep it simple and just return the network response.
            return response;
          })
          .catch(() => {
            // If the network fetch fails (e.g., user is offline),
            // return a fallback offline page.
            return caches.match('/offline');
          });
      })
  );
});

// 4. Periodic Sync Event:
// Fired at intervals to fetch fresh data in the background.
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'get-latest-data') {
        console.log('Service Worker: Performing periodic sync...');
        event.waitUntil(
            // Replace this with your actual data fetching logic,
            // e.g., fetching new routes or messages and caching them.
            fetch('/api/latest-updates')
                .then(response => response.json())
                .then(data => {
                    console.log('Service Worker: Periodic sync successful.', data);
                    // Here you would typically update your cache with the new data.
                })
                .catch(err => {
                    console.error('Service Worker: Periodic sync failed.', err);
                })
        );
    }
});

// 5. Background Sync Event:
// Fired when connectivity is restored for tasks tagged with 'sync-data'.
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-form-submission') {
        console.log('Service Worker: Performing background sync...');
        event.waitUntil(
            // Replace this with your logic to send queued data.
            // Example: read from IndexedDB and send to server.
            console.log("Would be sending queued data now...")
        );
    }
});
