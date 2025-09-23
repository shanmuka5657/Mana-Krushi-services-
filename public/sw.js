
const CACHE_NAME = 'mana-krushi-cache-v1';
const OFFLINE_URL = '/offline';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/styles/globals.css', // Adjust if your CSS path is different
  // Add other critical assets like logo, main script files
  'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add the offline page to the cache
        return cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

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
          console.log('Fetch failed; returning offline page instead.', error);

          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
  } else {
     event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
     );
  }
});


// --- Push Notifications ---
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
  const title = data.title;
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo72.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// --- Background Sync ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
        // Here you would typically sync data with your server
        console.log("Background sync event triggered for 'sync-data'.")
    );
  }
});


// --- Periodic Background Sync ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-daily-updates') {
    event.waitUntil(
        console.log("Periodic sync event for 'get-daily-updates' triggered.")
        // Here you could fetch new routes, messages, etc.
    );
  }
});
