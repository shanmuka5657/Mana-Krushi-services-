
const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install Event - Cache initial resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching essential files...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Service Worker: Deleting outdated cache ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Event - Network falling back to cache
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/offline'))
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Cache the new resource for future use
                if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // If the network fails, try to get it from the cache
                return caches.match(event.request);
            })
    );
});


// Background Sync (optional for offline form submission or syncing data)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Example Sync Function: Sync data with server when back online
async function syncData() {
  console.log('Service Worker: Syncing data with server...');
  // Your data sync logic here (e.g., send data to server)
}

// Push Notifications
self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
  
  const options = {
    body: payload.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/') // Open your app when the notification is clicked
  );
});
