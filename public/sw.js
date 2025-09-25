// Custom Service Worker

const CACHE_NAME = 'mana-krushi-cache-v1';
const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json'
];

// Install Event: Cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching essential files...');
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error('Service Worker: Caching failed', err);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
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

// Fetch Event: Cache-first, then network, with offline fallback
self.addEventListener('fetch', (event) => {
  // Let the browser handle requests for Firebase assets
  if (event.request.url.includes('firestore.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If the request is successful, update the cache
        if (networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      });

      // Return cached response if available, otherwise fetch from network
      // If network fails, fall back to offline page
      return cachedResponse || fetchPromise.catch(() => {
        // If the request is for a document, show the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('/offline');
        }
      });
    })
  );
});

// Background Sync (for features like offline form submission)
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event received', event.tag);
  if (event.tag === 'sync-data') {
    event.waitUntil(console.log('Syncing data...'));
  }
});
