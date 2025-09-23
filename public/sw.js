
const CACHE_NAME = 'mana-krushi-cache-v1';
const OFFLINE_URL = '/offline';
const ASSETS_TO_CACHE = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil((async () => {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(ASSETS_TO_CACHE);
      console.log('Service Worker: Caching complete.');
    } catch (error) {
      console.error('Service Worker: Cache addAll failed:', error);
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (cacheName) => {
        if (cacheName !== CACHE_NAME) {
          console.log('Service Worker: Deleting old cache:', cacheName);
          await caches.delete(cacheName);
        }
      })
    );
    await self.clients.claim();
    console.log('Service Worker: Activated and clients claimed.');
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        console.log('Fetch failed; returning offline page instead.', error);
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  } else {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await fetch(event.request);
        // Don't cache opaque responses (from third-party CDNs without CORS)
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            await cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
         return new Response(null, { status: 404 });
      }
    })());
  }
});


// --- Push Notifications ---
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  const data = event.data ? event.data.json() : { title: 'Mana Krushi Services', body: 'You have a new notification.' };
  const { title, body, icon, image } = data;

  const options = {
    body: body,
    icon: icon || '/logo192.png',
    badge: '/logo192.png',
    image: image,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});


// --- Background & Periodic Sync ---
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background Sync event received', event.tag);
    if (event.tag === 'example-sync') {
        event.waitUntil(
            // Example: Perform a data sync operation here
            console.log('Performing background sync for example-sync tag.')
        );
    }
});

self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic Sync event received', event.tag);
    if (event.tag === 'get-daily-news') {
        event.waitUntil(
           // Example: Fetch new content periodically
           console.log('Performing periodic sync for get-daily-news tag.')
        );
    }
});
