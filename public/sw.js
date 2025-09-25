// Choose a cache name
const CACHE_NAME = 'mana-krushi-services-cache-v1';
// List the files to precache
const PRECACHE_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/styles/globals.css', // Adjust path if needed
  // Add other critical assets like logo, main script files etc.
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Precaching files');
        return cache.addAll(PRECACHE_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activate');
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for network requests.
self.addEventListener('fetch', event => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
        (async () => {
          try {
            // First, try to use the navigation preload response if it's supported.
            const preloadResponse = await event.preloadResponse;
            if (preloadResponse) {
              return preloadResponse;
            }

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
        })()
    );
  } else {
     // For non-navigation requests, use a cache-first strategy
     event.respondWith(
        caches.open(CACHE_NAME).then(async (cache) => {
            const cachedResponse = await cache.match(event.request.url);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            const networkResponse = await fetch(event.request);
            // Cache the new response for future use.
            event.waitUntil(
                cache.put(event.request, networkResponse.clone())
            );
            return networkResponse;
        })
     );
  }
});


// --- Push Notification Handler ---
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received.');
  if (!event.data) {
    console.error('[Service Worker] Push event but no data');
    return;
  }
  const data = event.data.json();
  console.log('[Service Worker] Push data:', data);

  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    data: {
        url: data.data?.url || self.location.origin
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, then open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});


// --- Background & Periodic Sync Handlers ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-background-sync') {
    console.log('[Service Worker] Background sync event triggered');
    event.waitUntil(
      // Perform background tasks here, e.g., sending queued data
      new Promise((resolve) => {
        console.log('Performing background sync task...');
        setTimeout(resolve, 2000); // Simulate network task
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-periodic-sync') {
    console.log('[Service Worker] Periodic sync event triggered');
    event.waitUntil(
       // Perform periodic tasks here, e.g., fetching new content
       new Promise((resolve) => {
        console.log('Performing periodic sync task...');
        setTimeout(resolve, 2000); // Simulate content fetch
      })
    );
  }
});
