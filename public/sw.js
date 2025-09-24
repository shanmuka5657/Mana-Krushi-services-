// This is a basic service worker that provides a robust offline experience.
// It uses a "Cache-First" strategy for all requests.

const CACHE_NAME = 'mana-krushi-cache-v1';

// Add the paths to the files you want to pre-cache.
// This is the "App Shell" - the minimal files needed to run the app offline.
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json'
    // Add other critical assets like a global CSS file if its name is static.
    // e.g., '/css/style.css'
];


// On install, pre-cache the App Shell.
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching App Shell');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => {
                // Force the waiting service worker to become the active service worker.
                return self.skipWaiting();
            })
    );
});

// On activation, clean up old caches.
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
        }).then(() => {
            // Tell the active service worker to take control of the page immediately.
            return self.clients.claim();
        })
    );
});


// On fetch, use a Cache-First strategy.
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            // 1. Try to get the response from the cache.
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                // If we found a match in the cache, return it.
                return cachedResponse;
            }

            // 2. If not in cache, try to fetch from the network.
            try {
                const networkResponse = await fetch(event.request);
                
                // If the fetch is successful, clone it and store it in the cache.
                // We need to clone it because a response is a stream and can only be consumed once.
                if (networkResponse.ok) {
                    cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            } catch (error) {
                // 3. If the network fails (user is offline), and it's a navigation request, show the offline fallback page.
                console.log('[Service Worker] Fetch failed, returning offline page.', error);
                if (event.request.mode === 'navigate') {
                    return cache.match('/offline.html');
                }
                // For other types of requests (e.g., images, API calls), you might want to return a different placeholder or nothing.
                return new Response(null, { status: 404 });
            }
        })
    );
});
