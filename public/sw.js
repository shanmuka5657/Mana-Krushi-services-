// Define a cache name
const CACHE_NAME = 'mana-krushi-cache-v1';
// List of files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/styles/globals.css', // Adjust this path based on your actual file structure
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png',
  '/manifest.json'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(cachedResponse => {
            // Cache hit - return response from cache
            if (cachedResponse) {
                return cachedResponse;
            }

            // Not in cache - fetch from network
            return fetch(event.request).then(
                networkResponse => {
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
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return networkResponse;
                }
            ).catch(error => {
                // Network request failed, try to serve offline page for navigations
                console.log('Fetch failed; returning offline page instead.', error);
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline');
                }
            });
        })
    );
});


// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', event => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/images/icons/icon-192x192.png',
    badge: data.badge || '/images/icons/badge-72x72.png',
    data: {
      url: data.url || self.location.origin
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('On notification click: ', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({
      type: 'window'
    }).then(clientList => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// --- BACKGROUND & PERIODIC SYNC ---
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('Background sync triggered!');
        // Here you would typically perform data synchronization tasks
        event.waitUntil(
            new Promise((resolve, reject) => {
                // Simulate a network request
                console.log("Simulating background data sync...");
                setTimeout(resolve, 2000);
            })
        );
    }
});

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'fetch-latest-news') {
        console.log('Periodic sync triggered!');
        // Here you would fetch latest data periodically
        event.waitUntil(
             new Promise((resolve, reject) => {
                // Simulate a network request
                console.log("Simulating periodic data fetch...");
                setTimeout(resolve, 2000);
            })
        );
    }
});