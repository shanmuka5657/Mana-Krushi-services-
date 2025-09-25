// Choose a cache name
const CACHE_NAME = 'mana-krushi-services-v1';
// List the files to precache
const PRECACHE_ASSETS = [
    '/',
    '/offline',
    // Add other critical assets like CSS, JS, and key images
    // Note: This list will need to be maintained. A build tool can automate this.
];


// The install event is fired when the service worker
// is first installed.
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline page');
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// The activate event is fired after the service worker is installed.
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate');
    // Clean up old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Removing old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});


// The fetch event is fired for every network request.
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
        (async () => {
          try {
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
              return preloadResponse;
            }

            const networkResponse = await fetch(event.request);
            return networkResponse;
          } catch (error) {
            console.log('[Service Worker] Fetch failed; returning offline page instead.', error);

            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match('/offline');
            return cachedResponse;
          }
        })()
    );
  }
});


// --- Push Notification Event Listener ---
self.addEventListener('push', (event) => {
    if (!event.data) {
        console.log("This push event has no data.");
        return;
    }
    console.log('[Service Worker] Push Received.');
    console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    const data = event.data.json();
    const title = data.title || 'Mana Krushi Services';
    const options = {
        body: data.body || 'You have a new notification.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(self.registration.showNotification(title, options));
});

// --- Notification Click Event Listener ---
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    
    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientsArr) => {
            // If a window is already open, focus it.
            const hadWindowToFocus = clientsArr.some((windowClient) =>
                windowClient.url === urlToOpen ? (windowClient.focus(), true) : false
            );

            // Otherwise, open a new window.
            if (!hadWindowToFocus)
                clients.openWindow(urlToOpen).then((windowClient) => (windowClient ? windowClient.focus() : null));
        })
    );
});
