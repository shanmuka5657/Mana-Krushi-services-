'use strict';

const CACHE_NAME = 'mana-krushi-cache-v1';
const PRECACHE_URLS = [
    '/',
    '/offline',
    '/styles/globals.css', // Adjust if your global CSS path is different
    'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg'
];


self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request).catch(() => caches.match('/offline'));
        })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});


self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  const pushData = event.data.json();

  const title = pushData.title || 'Mana Krushi';
  const options = {
    body: pushData.body || 'You have a new notification.',
    icon: pushData.icon || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg',
    badge: pushData.badge || 'https://i.ibb.co/mrqBwfds/IMG-20250920-WA0025.jpg',
    data: {
        url: pushData.data?.url || self.location.origin
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification click Received.');
    event.notification.close();
    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: "window"
        })
        .then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});


self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event fired:', event);
  if (event.tag === 'background-sync-example') {
    event.waitUntil(
      // Perform some background task, e.g., sending queued data
      new Promise((resolve, reject) => {
        console.log('Performing background sync task...');
        // Simulate a network request
        setTimeout(() => {
          console.log('Background sync task completed.');
          self.registration.showNotification('Background Sync', {
            body: 'Background sync task completed successfully!'
          });
          resolve();
        }, 5000);
      })
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  console.log('[Service Worker] Periodic sync event fired:', event);
  if (event.tag === 'periodic-sync-example') {
    event.waitUntil(
      new Promise((resolve, reject) => {
        console.log('Performing periodic sync task...');
        setTimeout(() => {
            console.log('Periodic sync task completed.');
            self.registration.showNotification('Periodic Sync', {
                body: 'Content updated in the background.'
            });
            resolve();
        }, 10000);
      })
    );
  }
});
