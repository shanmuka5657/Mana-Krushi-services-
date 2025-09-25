// A simple, robust service worker for caching and offline support.

const CACHE_NAME = 'mana-krushi-v1';
const OFFLINE_URL = '/offline';

const urlsToCache = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/styles/globals.css', // Adjust path if needed
  'https://i.ibb.co/6Rrvs6tM/Whats-App-Image-2025-09-20-at-13-02-57-9dc142ff.png' // App icon
];

// --- 1. Install Service Worker & Cache Assets ---
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Force the waiting service worker to become the active service worker.
        return self.skipWaiting();
      })
  );
});

// --- 2. Activate Service Worker & Clean Up Old Caches ---
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// --- 3. Fetch Event: Serve from Cache or Network, with Offline Fallback ---
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response from cache.
        if (response) {
          return response;
        }

        // Not in cache - fetch from network.
        return fetch(event.request).then(
          (networkResponse) => {
            // Optional: Clone and cache the new request for future offline use.
            // Be careful with what you cache. Don't cache API calls with sensitive data.
            if (networkResponse && networkResponse.status === 200 && !event.request.url.includes('firestore')) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          }
        ).catch(() => {
          // Network fetch failed, and not in cache.
          // For navigation requests (to a new page), serve the offline page.
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
          // For other requests (images, etc.), just fail.
          return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});

// --- 4. Push Notification Event ---
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  if (!event.data) {
    console.error('Push event but no data');
    return;
  }

  const data = event.data.json();
  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new message.',
    icon: data.icon || 'https://i.ibb.co/6Rrvs6tM/Whats-App-Image-2025-09-20-at-13-02-57-9dc142ff.png',
    badge: 'https://i.ibb.co/6Rrvs6tM/Whats-App-Image-2025-09-20-at-13-02-57-9dc142ff.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- 5. Notification Click Event ---
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click Received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// --- 6. Background Sync Event ---
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background Sync event triggered', event);
    if (event.tag === 'send-message-sync') {
        console.log('[Service Worker] Processing background sync for sending messages...');
        // Here you would add the logic to send any queued messages.
        // For example, read from IndexedDB and send to the server.
    }
});

// --- 7. Periodic Background Sync Event ---
self.addEventListener('periodicsync', (event) => {
    console.log('[Service Worker] Periodic Sync event triggered', event);
    if (event.tag === 'get-latest-news') {
        console.log('[Service Worker] Fetching latest content in the background...');
        // Here you would add logic to fetch new data and update the cache.
        event.waitUntil(
            // fetch('/api/latest-news').then(response => cache.put('/api/latest-news', response))
        );
    }
});
