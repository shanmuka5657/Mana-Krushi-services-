// public/sw.js
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

// Clean up old caches on activate
self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const names = await caches.keys();
        await Promise.all(names.map(name => {
            if (name !== CACHE_NAME) {
                return caches.delete(name);
            }
        }));
        await self.clients.claim();
    })());
});

// Cache-first, falling back to network fetch strategy
self.addEventListener('fetch', event => {
    // We only want to handle navigation requests
    if (event.request.mode !== 'navigate') {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        
        try {
            // 1. Try to get from the network first
            const networkResponse = await fetch(event.request);
            // If successful, put a copy in the cache
            if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
        } catch (error) {
            // 2. If network fails, try to get from cache
            console.log('Fetch failed; trying cache instead.', error);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // 3. If both network and cache fail, show offline page
            console.log('No cached response found; returning offline page.');
            const offlinePage = await cache.match('/offline.html');
            return offlinePage;
        }
    })());
});

// Listener for incoming push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'New Notification',
    body: 'Something new has happened!',
    icon: '/icons/icon-192x192.png' // Default icon
  };

  // Check if the push event has data and is valid JSON
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData.title = data.title || notificationData.title;
      notificationData.body = data.body || notificationData.body;
      notificationData.icon = data.icon || notificationData.icon;
    } catch (e) {
      console.error('Push event data is not valid JSON:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon
    })
  );
});

// Listener for notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
