// Define a cache name
const CACHE_NAME = 'mana-krushi-services-cache-v1';

// List of files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/styles/globals.css', // Adjust this path if your global CSS is elsewhere
  '/manifest.json'
  // Add other critical assets like a logo here if needed
  // e.g., '/logo.png'
];

// Install event: cache the app shell
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App shell cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event: clean up old caches
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
      console.log('Service Worker: Activated and ready');
      return self.clients.claim();
    })
  );
});

// Fetch event: serve from cache or network, with offline fallback
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the request is in the cache, return it
        if (response) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // If the request is not in the cache, fetch it from the network
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // If we got a valid response, cache it and return it
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // If the network request fails (e.g., offline) and it's a navigation request,
            // return the offline fallback page.
            if (event.request.mode === 'navigate') {
              console.log('Service Worker: Serving offline page.');
              return caches.match('/offline');
            }
            // For other types of requests (e.g., images, API calls), you might want to return a different fallback
            // or just let the request fail.
          });
      })
  );
});


// --- Push Notification Event Listener ---
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push Received.');
    const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
    const { title, body, icon, image } = data;

    const options = {
        body: body,
        icon: icon || '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
        image: image,
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked.');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});


// --- Background & Periodic Sync Event Listeners ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-form-data') {
    console.log('Service Worker: Background sync event for "send-form-data" received.');
    // Here you would add the logic to send any queued data to the server
    event.waitUntil(
      new Promise((resolve, reject) => {
        // Simulate sending data
        console.log("Attempting to send data in background...");
        // In a real app, you would fetch data from IndexedDB and POST it.
        setTimeout(() => {
          console.log("Background data sent successfully!");
          resolve();
        }, 2000);
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-content') {
    console.log('Service Worker: Periodic sync event for "get-latest-content" received.');
    // Here you would add logic to fetch new content and cache it
    event.waitUntil(
        new Promise((resolve, reject) => {
            console.log("Fetching latest content periodically...");
            // e.g., fetch('/latest-news').then(response => cache.put('/latest-news', response));
            setTimeout(() => {
                console.log("Periodic content fetched and cached.");
                resolve();
            }, 3000);
        })
    );
  }
});
