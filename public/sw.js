const CACHE_NAME = 'mana-krushi-cache-v1';
const PRECACHE_ASSETS = [
    '/',
    '/offline.html',
    '/manifest.json'
];

// Pre-cache assets on install
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(PRECACHE_ASSETS);
    })());
    self.skipWaiting();
});

// Clean up old caches on activation
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Cache-First Fetch Strategy
self.addEventListener('fetch', event => {
    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        
        // Try to get the response from the cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            // If not in cache, try to fetch from the network
            const networkResponse = await fetch(event.request);
            
            // If the network request is successful, cache the new response
            if (networkResponse.ok) {
                await cache.put(event.request, networkResponse.clone());
            }

            return networkResponse;
        } catch (error) {
            // If the network fails and the request is for a page, show the offline fallback page
            if (event.request.mode === 'navigate') {
                return cache.match('/offline.html');
            }
            // For other asset types (images, etc.), just fail without a fallback
            return new Response(null, { status: 404 });
        }
    })());
});

// --- Push Notification Event Listener ---
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/images/icons/icon-192x192.png', // Default icon
    badge: '/images/icons/icon-96x96.png', // Badge for the notification bar
    ...data.options,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// --- Notification Click Event Listener ---
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      const urlToOpen = event.notification.data?.url || '/';
      
      // If a window for the app is already open, focus it
      if (clientList.length > 0) {
        let client = clientList[0];
        for (const c of clientList) {
            if (c.url === urlToOpen && 'focus' in c) {
                client = c;
                break;
            }
        }
        if (client && 'focus' in client) {
            client.focus();
            client.navigate(urlToOpen);
        }
      }
      
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
