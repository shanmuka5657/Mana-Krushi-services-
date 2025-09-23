// Service Worker

const CACHE_NAME = 'mana-krushi-services-v1';
const OFFLINE_URL = '/offline';

// On install, cache the offline page and other essential assets
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        // Add other assets to pre-cache here if needed
        await cache.addAll([
            '/',
            '/manifest.json',
            '/logo192.png',
            '/logo512.png'
        ]);
    })());
    self.skipWaiting();
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        if ('navigationPreload' in self.registration) {
            await self.registration.navigationPreload.enable();
        }
        // Clean up old caches
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                    return caches.delete(cacheName);
                }
            })
        );
    })());
    self.clients.claim();
});


// Handle fetch requests
self.addEventListener('fetch', (event) => {
    // We only want to handle navigation requests
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                // First, try to use the navigation preload response if it's supported
                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) {
                    return preloadResponse;
                }

                // Always try the network first for navigation
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                // Catch is only triggered if the network fails
                console.log('Fetch failed; returning offline page instead.', error);

                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match(OFFLINE_URL);
                return cachedResponse;
            }
        })());
    }

    // For other requests (CSS, JS, images), use a cache-first strategy
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(event.request);
            // If the request is successful, clone it and store it in the cache
            if (networkResponse.ok) {
                await cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            console.log('Fetch failed for non-navigation request:', error);
            // For non-navigation requests, we don't return the offline page, just fail.
            // You might want to return a placeholder image for failed image requests, for example.
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
        }
    })());
});

// --- Push Notifications ---
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new message.' };
    const { title, body, icon, badge } = data;
    
    const options = {
        body: body,
        icon: icon || '/logo192.png',
        badge: badge || '/logo192.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});


// --- Periodic Sync ---
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'get-daily-update') {
        event.waitUntil(fetchAndCacheLatestData());
    }
});

async function fetchAndCacheLatestData() {
    // This is a placeholder. In a real app, you would fetch fresh data
    // from your server and update the cache.
    console.log("Periodic sync triggered: 'get-daily-update'.");
    // For example:
    // const response = await fetch('/api/latest-routes');
    // const data = await response.json();
    // const cache = await caches.open(CACHE_NAME);
    // await cache.put('/api/latest-routes', new Response(JSON.stringify(data)));
}


// --- Background Sync ---
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-new-booking') {
        event.waitUntil(syncNewBooking());
    }
});

async function syncNewBooking() {
    // This is a placeholder. In a real app, you would get pending data 
    // from IndexedDB and send it to the server.
    console.log("Background sync triggered: 'sync-new-booking'.");
    // For example:
    // const pendingBookings = await getPendingBookingsFromIDB();
    // for (const booking of pendingBookings) {
    //    await fetch('/api/book', {
    //        method: 'POST',
    //        body: JSON.stringify(booking),
    //        headers: {'Content-Type': 'application/json'}
    //    });
    // }
}
