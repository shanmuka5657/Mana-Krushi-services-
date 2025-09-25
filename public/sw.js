
// public/sw.js

// Choose a cache name
const cacheName = 'mana-krushi-services-v1';

// List the files to precache. Add any other critical assets your app needs to function offline.
const precacheFiles = [
    '/',
    '/manifest.json',
    '/favicon.ico',
    // Add paths to your most important JS, CSS, and image files here
    // e.g., '/app/globals.css'
];


self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    // Pre-cache main assets.
    try {
        await cache.addAll(precacheFiles);
    } catch(error) {
        console.error("Failed to cache files during install:", error);
    }
  })());
});

// --- Offline Support: Network falling back to cache strategy ---
self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    // Try to get the response from the network first
    try {
      const response = await fetch(e.request);
      // If we get a valid response, open the cache and put the new response in it
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      // Return the response from the network
      return response;
    } catch (error) {
      // If the network request fails (e.g., user is offline),
      // try to get the response from the cache.
      console.log(`[Service Worker] Network failed, trying cache for: ${e.request.url}`);
      const r = await caches.match(e.request);
      if (r) {
        console.log(`[Service Worker] Serving from cache: ${e.request.url}`);
        return r;
      }
      // If the resource is not in the cache, the request will fail,
      // which is the expected behavior for resources that haven't been cached.
       console.log(`[Service Worker] Resource not found in cache: ${e.request.url}`);
       // Optionally, return a fallback offline page here
       // return caches.match('/offline.html');
    }
  })());
});


// --- Push Notifications ---
self.addEventListener('push', (event) => {
  const pushData = event.data.json();
  
  const options = {
    body: pushData.body,
    icon: '/images/icons/icon-192x192.png', // Default icon
    badge: '/images/icons/icon-96x96.png', // Optional: for notification bar on Android
    data: {
        url: pushData.url || '/' // URL to open on click
    }
  };

  event.waitUntil(
    self.registration.showNotification(pushData.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      if (clientList.length > 0) {
        let client = clientList.find(c => c.url === urlToOpen && 'focus' in c);
        if (client) {
            return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});


// --- Background Sync ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-background-sync') {
    console.log('[Service Worker] Background sync started');
    event.waitUntil(
      // This is where you'd put the logic to retry a failed network request,
      // for example, resubmitting a form.
      // For demonstration, we'll just log a message.
      new Promise((resolve, reject) => {
        console.log('[Service Worker] Performing background task...');
        // Simulate a task
        setTimeout(() => {
          console.log('[Service Worker] Background task finished.');
          resolve();
        }, 2000);
      })
    );
  }
});

// --- Periodic Background Sync ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-periodic-sync') {
    console.log('[Service Worker] Periodic background sync started');
    event.waitUntil(
      // This is where you would fetch new content.
      // For demonstration, we'll just log a message.
      new Promise((resolve, reject) => {
        console.log('[Service Worker] Fetching new content periodically...');
        // Simulate content fetch
        setTimeout(() => {
          console.log('[Service Worker] Periodic content fetch finished.');
          resolve();
        }, 5000);
      })
    );
  }
});
