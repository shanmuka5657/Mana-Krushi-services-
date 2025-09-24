// A robust service worker based on the provided documentation and best practices.

const CACHE_NAME = 'mana-krushi-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/favicon.ico', // Assuming you might add one later
];

// Listener for the install event - pre-caches our assets list on service worker install.
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        try {
            const cache = await caches.open(CACHE_NAME);
            await cache.addAll(PRECACHE_ASSETS);
            console.log('Service Worker: Pre-caching complete.');
        } catch (error) {
            console.error('Service Worker: Pre-caching failed:', error);
        }
    })());
});

// Listener for the activate event - claims clients and cleans up old caches.
self.addEventListener('activate', event => {
    // Claim clients immediately to take control of the page.
    event.waitUntil(self.clients.claim());

    // Clean up old caches
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.filter(name => {
                return name !== CACHE_NAME;
            }).map(name => caches.delete(name))
        );
        console.log('Service Worker: Old caches cleaned.');
    })());
});

// Listener for the fetch event - intercepts requests and defines a fetch strategy.
self.addEventListener('fetch', event => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For navigation requests (i.e., for HTML documents), use a network-first strategy.
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                // First, try to fetch from the network.
                const networkResponse = await fetch(event.request);
                
                // If the fetch is successful, cache it and return it.
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                
                return networkResponse;
            } catch (error) {
                // If the network fails, try to serve from the cache.
                console.log('Service Worker: Network request failed, trying cache.', error);
                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(event.request);
                
                // If found in cache, return it. Otherwise, return the offline page.
                return cachedResponse || await cache.match('/offline');
            }
        })());
        return;
    }

    // For non-navigation requests (CSS, JS, images), use a cache-first strategy.
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
            // Cache hit, return the response from cache.
            return cachedResponse;
        }

        // Cache miss, go to the network.
        try {
            const networkResponse = await fetch(event.request);
            
            // Response may be used only once. We need to clone it to use it both by browser and cache.
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
            
            return networkResponse;
        } catch (error) {
            // If the network also fails (e.g., offline), we can't do much.
            // For images, you could return a placeholder, but for scripts/styles, it's usually best to fail.
            console.error('Service Worker: Fetch failed for non-navigation request:', event.request.url, error);
            // The browser will handle the failed request as it normally would.
            return new Response('', {status: 503, statusText: 'Service Unavailable'});
        }
    })());
});
