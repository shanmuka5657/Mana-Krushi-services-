// A basic, offline-first service worker

const CACHE_NAME = 'mana-krushi-cache-v1';
// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    '/',
    '/offline',
    '/styles/globals.css', // Adjust path based on your project structure
    // Add other critical assets like logo, main script files, etc.
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
            .catch(err => {
                console.error('Service worker install failed:', err);
            })
    );
});

self.addEventListener('activate', event => {
    // Tell the active service worker to take control of the page immediately.
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', event => {
    // We only want to call event.respondWith() if this is a navigation request
    // for an HTML page.
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                // First, try to use the navigation preload response if it's supported.
                const preloadResponse = await event.preloadResponse;
                if (preloadResponse) {
                    return preloadResponse;
                }

                // Always try the network first.
                const networkResponse = await fetch(event.request);
                return networkResponse;
            } catch (error) {
                // catch is only triggered if an exception is thrown, which is likely
                // due to a network error.
                // If fetch() returns a valid HTTP response with a 4xx or 5xx status,
                // the catch() will NOT be called.
                console.log('Fetch failed; returning offline page instead.', error);

                const cache = await caches.open(CACHE_NAME);
                const cachedResponse = await cache.match('/offline');
                return cachedResponse;
            }
        })());
    }

    // For non-navigation requests, use a cache-first strategy.
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                // Optional: Cache new resources dynamically
                // if (fetchResponse.ok) {
                //     const cache = await caches.open(CACHE_NAME);
                //     cache.put(event.request, fetchResponse.clone());
                // }
                return fetchResponse;
            });
        })
    );
});


// --- PUSH NOTIFICATIONS (Placeholder) ---
self.addEventListener('push', event => {
  const title = 'Mana Krushi Services';
  const options = {
    body: event.data ? event.data.text() : 'You have a new notification.',
    icon: '/images/icons/icon-192x192.png', // Make sure this path is correct
    badge: '/images/icons/badge-72x72.png' // Make sure this path is correct
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- BACKGROUND SYNC (Placeholder) ---
self.addEventListener('sync', event => {
  if (event.tag == 'my-first-sync') {
    event.waitUntil(
        // Do some sync work here
        console.log("Background sync triggered!")
    );
  }
});

// --- PERIODIC SYNC (Placeholder) ---
self.addEventListener('periodicsync', event => {
  if (event.tag == 'get-daily-updates') {
    event.waitUntil(
        // Do some periodic sync work here
        console.log("Periodic background sync triggered!")
    );
  }
});
