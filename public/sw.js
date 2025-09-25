// Define a cache name
const CACHE_NAME = 'mana-krushi-cache-v2';
// List of files to cache
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
];

// 1. Install the service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch event - Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // We only want to intercept navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's supported
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          
          // Always try the network first for navigation requests
          const networkResponse = await fetch(event.request);
          // If we get a response from the network, cache it and return it
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // The network failed, so we'll serve the offline page from the cache
          console.log('Fetch failed; returning offline page instead.', error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match('/offline');
          return cachedResponse;
        }
      })()
    );
  } else if (urlsToCache.includes(new URL(event.request.url).pathname)) {
      // For app shell files, use a cache-first strategy
      event.respondWith(
          caches.match(event.request).then((response) => {
              return response || fetch(event.request);
          })
      );
  }
});


// --- PUSH NOTIFICATIONS & SYNC ---
// This part remains unchanged as it was working correctly.

self.addEventListener('push', (event) => {
  const data = event.data.json();
  console.log('Push received:', data);

  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg',
    badge: data.badge || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg',
    data: {
      url: data.url || self.registration.scope
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].navigate(urlToOpen).then(client => client.focus());
      }
      return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener('sync', (event) => {
  console.log('Background sync event fired:', event);
  if (event.tag === 'background-sync-example') {
    event.waitUntil(
      new Promise((resolve, reject) => {
        // Here you would perform the action that needs to be synced,
        // e.g., sending a form submission that failed while offline.
        console.log('Performing background sync action...');
        setTimeout(resolve, 2000);
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('Periodic sync event fired:', event);
  if (event.tag === 'periodic-sync-example') {
    event.waitUntil(
      new Promise((resolve, reject) => {
        // Here you would perform a periodic action,
        // e.g., fetching new content in the background.
        console.log('Performing periodic background sync...');
        setTimeout(resolve, 2000);
      })
    );
  }
});
