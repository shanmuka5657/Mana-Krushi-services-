// A simple, offline-first service worker
const CACHE_NAME = 'mana-krushi-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/src/app/globals.css', // Added essential stylesheet
    '/favicon.ico' // Added favicon
];

// On install, pre-cache the static assets
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(PRECACHE_ASSETS);
        } catch (e) {
            console.error('Service worker pre-caching failed:', e);
        }
    })());
});

// On activate, take control of all pages
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', event => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // Cache hit - return response
            if (cachedResponse) {
                return cachedResponse;
            }

            // Not in cache - go to network
            return fetch(event.request).then(
                response => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and because we want the browser to consume the response
                    // as well as the cache consuming the response, we need
                    // to clone it so we have two streams.
                    var responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }
            ).catch(() => {
                // If the network request fails and it's a navigation request, show the offline page.
                if (event.request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
                return new Response(null, { status: 404, statusText: "Offline" });
            });
        })
    );
});
