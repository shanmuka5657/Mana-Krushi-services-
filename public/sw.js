// Define a cache name
const CACHE_NAME = 'mana-krushi-cache-v1';

// List of files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/styles/globals.css', // Assuming you have a global stylesheet
  // Add other critical assets like logo, main JS bundles etc.
  'https://i.ibb.co/6Rrvs6t/Whats-App-Image-2025-09-20-at-13-02-57-9dc142ff.png'
];

// 1. Install Event: Cache critical assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache).catch(err => {
            console.error('Service Worker: Failed to cache app shell.', err);
        });
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
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Network request failed, probably offline
        // If it's a navigation request, show the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      })
  );
});


// 3. Activate Event: Clean up old caches
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
    })
  );
});


// --- Push Notification Handlers ---

self.addEventListener('push', event => {
  console.log('Service Worker: Push Received.');
  const { title, body, icon, image } = event.data.json();

  const options = {
    body: body,
    icon: icon || '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png', // Small icon for notification bar
    image: image,
    actions: [
      { action: 'explore', title: 'Explore' },
      { action: 'close', title: 'Close' },
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click Received.');
  event.notification.close();

  if (event.action === 'explore') {
    // Open a specific page, e.g., the dashboard
    event.waitUntil(clients.openWindow('/dashboard'));
  } else {
    // Default action: focus the app or open the main page
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
  }
});


// --- Background Sync Handlers ---

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-booking') {
    console.log('Service Worker: Sync event for "sync-new-booking" received.');
    // Here you would typically read data from IndexedDB and send it to the server.
    // This is a placeholder for that logic.
    event.waitUntil(
      new Promise((resolve, reject) => {
        console.log("Simulating sending synced data...");
        // Simulate a network request
        setTimeout(() => {
          console.log("Synced data sent successfully.");
          self.registration.showNotification('Booking Synced!', {
            body: 'Your booking made while offline has been confirmed.'
          });
          resolve();
        }, 2000);
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-routes') {
    console.log('Service Worker: Periodic sync for "get-latest-routes" received.');
    // Here you would fetch new data from the server and cache it.
    event.waitUntil(
       new Promise((resolve, reject) => {
        console.log("Simulating fetching latest routes...");
        setTimeout(() => {
            console.log("Latest routes fetched and cached.");
            // You could show a notification, but it's often better to be silent.
            resolve();
        }, 5000);
       })
    );
  }
});
