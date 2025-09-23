// A unique version name for the cache. Change this on every deployment.
const CACHE_VERSION = 'mana-krushi-v2';
const CACHE_NAME = `mana-krushi-cache-${CACHE_VERSION}`;

// A list of essential files to be cached on installation.
const CORE_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// 1. Installation: Cache the core assets of the application.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting(); // Force the new service worker to become active immediately.
});

// 2. Activation: Clean up old caches.
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete any caches that are not the current version.
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all open clients (tabs) to ensure they use the new SW.
            return self.clients.claim();
        })
    );
});

// 3. Fetch: Define caching strategies for different types of requests.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // A. For navigation requests (HTML pages), use a Network-First strategy.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // If the network request is successful, cache a copy and return it.
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                    return response;
                })
                .catch(() => {
                    // If the network fails, serve the cached offline page.
                    return caches.match(request).then((cachedResponse) => {
                        return cachedResponse || caches.match('/offline');
                    });
                })
        );
        return;
    }

    // B. For all other requests (CSS, JS, Images), use a Stale-While-Revalidate strategy.
    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(request).then((cachedResponse) => {
                // Fetch from network in the background to update the cache.
                const fetchPromise = fetch(request).then((networkResponse) => {
                    const responseToCache = networkResponse.clone();
                    cache.put(request, responseToCache);
                    return networkResponse;
                });

                // Return the cached response immediately if available, otherwise wait for the network.
                return cachedResponse || fetchPromise;
            });
        }).catch(() => {
            // Fallback for when both cache and network fail (for non-navigation requests).
            // This is less critical but good to have.
            if (request.destination === 'image') {
                // You could return a placeholder image here if needed.
            }
            return new Response('Network error occurred.', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' },
            });
        })
    );
});
