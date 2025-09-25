// Define a unique cache name for your app.
const CACHE_NAME = 'mana-krushi-v1';

// List of files to cache upon service worker installation.
const urlsToCache = [
  '/',
  '/offline', // Your custom offline fallback page
  '/globals.css', // Adjust this to your main stylesheet path
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// 1. Install Event: Cache essential app assets.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event: Serve cached content when offline.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          (response) => {
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
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Network request failed, serve offline page for navigations
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
        });
      })
  );
});

// 3. Activate Event: Clean up old caches.
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
});


// --- PUSH NOTIFICATION ---
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  
  let data = { title: 'New Message', body: 'You have a new message.' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push data', e);
    }
  }

  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- BACKGROUND SYNC & PERIODIC SYNC ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-background-sync') {
    console.log('[Service Worker] Background sync triggered!');
    event.waitUntil(
        // Here you would perform the background task, e.g., fetching data
        new Promise(resolve => {
            console.log("Performing background sync task...");
            setTimeout(resolve, 3000);
        })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-periodic-sync') {
    console.log('[Service Worker] Periodic sync triggered!');
    event.waitUntil(
        // Perform a recurring task, e.g., checking for new content
         new Promise(resolve => {
            console.log("Performing periodic sync task...");
            setTimeout(resolve, 3000);
        })
    );
  }
});
