// public/sw.js

const CACHE_NAME = 'mana-krushi-cache-v1';
const OFFLINE_URL = '/offline';

// --- Lifecycle Events ---

// On install, cache the offline page and essential assets.
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Service Worker: Caching app shell');
            // The offline page is the most important thing to cache.
            // Other assets will be cached on demand by the fetch handler.
            return cache.add(OFFLINE_URL);
        })
    );
    self.skipWaiting();
});

// On activate, clean up old caches.
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});


// --- Fetch Event for Offline Support ---
self.addEventListener('fetch', (event) => {
    // We only want to handle GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    
    // For navigation requests, use a network-first strategy with offline fallback.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // If the network request fails, serve the offline page from the cache.
                    return caches.match(OFFLINE_URL);
                })
        );
        return;
    }

    // For all other requests (CSS, JS, images), use a cache-first strategy.
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                // If we have a cached response, return it.
                return response;
            }
            // Otherwise, fetch from the network, cache it, and return the response.
            return fetch(event.request).then((networkResponse) => {
                // Check if we received a valid response
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                // Clone the response because it's a one-time-use stream.
                const responseToCache = networkResponse.clone();
                
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                
                return networkResponse;
            });
        })
    );
});


// --- PUSH NOTIFICATIONS ---
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push Received.');
    const pushData = event.data.json();

    const title = pushData.title || 'Mana Krushi Services';
    const options = {
        body: pushData.body || 'You have a new message.',
        icon: pushData.icon || '/images/icons/icon-192x192.png',
        badge: '/images/icons/badge-72x72.png',
        data: {
            url: pushData.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked.');
    event.notification.close();

    const urlToOpen = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                for (let i = 0; i < clientList.length; i++) {
                    if (clientList[i].focused) {
                        client = clientList[i];
                    }
                }
                return client.focus();
            }
            return clients.openWindow(urlToOpen);
        })
    );
});


// --- BACKGROUND SYNC ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-example') {
    console.log('Service Worker: Background Sync triggered!');
    event.waitUntil(
      // Here you would perform the action that failed, e.g., resend a form.
      // For this demo, we'll just log it.
      new Promise((resolve, reject) => {
        console.log("Simulating a background sync network request...");
        // This is where you might fetch/POST data.
        setTimeout(resolve, 3000);
      })
    );
  }
});


// --- PERIODIC BACKGROUND SYNC ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'periodic-sync-example') {
    console.log('Service Worker: Periodic Sync triggered!');
    event.waitUntil(
      // Here you would fetch new content for the user.
      // e.g., fetch('/latest-news').then(response => response.json()).then(data => cache.put(...))
      new Promise((resolve, reject) => {
        console.log("Simulating a periodic background sync network request...");
        setTimeout(resolve, 3000);
      })
    );
  }
});
