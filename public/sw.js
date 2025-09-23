// Service Worker

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
    '/',
    '/offline',
    '/manifest.json',
    '/globals.css',
    // Add other important assets like JS bundles, CSS files, key images
];

// 1. Install Event: Cache the application shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Use addAll to fetch and cache all the specified URLs
                return cache.addAll(urlsToCache);
            })
            .catch((err) => {
                console.error('Failed to open cache or cache files: ', err);
            })
    );
});

// 2. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. Fetch Event: Serve cached content when offline (Cache-first strategy)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response from the cache
                if (response) {
                    return response;
                }

                // Not in cache - fetch from the network
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
                ).catch(() => {
                    // If both cache and network fail (i.e., we are offline and the page isn't cached)
                    // return a fallback offline page.
                    return caches.match('/offline');
                });
            })
    );
});


// 4. Push Event: Handle push notifications
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new message.' };
    const options = {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// 5. Sync Event: Handle background synchronization
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // In a real app, you would perform the data synchronization here
            // e.g., sending queued data to the server
            console.log("Background sync event fired for 'sync-data'.")
        );
    }
});

// 6. Periodic Sync Event: Handle periodic background synchronization
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'get-daily-updates') {
         event.waitUntil(
             // In a real app, you would fetch new content here
            console.log("Periodic background sync event fired for 'get-daily-updates'.")
         );
    }
});

// Notification Click Event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
