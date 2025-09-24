// A simple, stable service worker with a Cache-First strategy.

const CACHE_NAME = 'mana-krushi-cache-v1';
const OFFLINE_URL = '/offline.html';
const PRECACHE_ASSETS = [
    '/',
    OFFLINE_URL,
    '/manifest.json'
];

// 1. Install the service worker and pre-cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching core assets.');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .catch(error => {
                console.error('[Service Worker] Pre-caching failed:', error);
            })
    );
    self.skipWaiting();
});

// 2. Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
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
        }).then(() => self.clients.claim())
    );
});

// 3. Intercept fetch requests (Cache-First strategy)
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 1. Check the cache for a matching request
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                // Return the cached response if found
                return cachedResponse;
            }

            // 2. If not in cache, go to the network
            try {
                const networkResponse = await fetch(event.request);
                
                // If the fetch is successful, clone the response and store it in the cache.
                // We need to clone it because a response is a stream and can only be consumed once.
                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // 3. If the network fails (offline), and it's a navigation request, show the offline page.
                console.log('[Service Worker] Fetch failed; returning offline page.', error);
                if (event.request.mode === 'navigate') {
                    const offlinePage = await cache.match(OFFLINE_URL);
                    return offlinePage;
                }
                
                // For other types of requests (e.g., images, API calls), just fail.
                // You could return a placeholder image here if desired.
                return new Response('Network error', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' },
                });
            }
        })
    );
});
