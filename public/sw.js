
// This is your service worker file.
// It's a background script that can intercept network requests,
// handle push notifications, and enable offline functionality.

const CACHE_NAME = 'mana-krushi-cache-v1';
const OFFLINE_URL = '/offline';

// --- 1. Install and Cache Assets ---
// This event runs when the service worker is first installed.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  // waitUntil() ensures that the service worker will not install until the
  // code inside has successfully completed.
  event.waitUntil(
    // Open a cache by name.
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // Add the offline page to the cache. This is crucial for offline fallback.
        return cache.add(OFFLINE_URL);
      })
      .then(() => {
        // self.skipWaiting() forces the waiting service worker to become the
        // active service worker.
        self.skipWaiting();
      })
  );
});

// --- 2. Activate and Clean Up Old Caches ---
// This event runs after the service worker has been successfully installed.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    // Get all the cache names.
    caches.keys().then((cacheNames) => {
      return Promise.all(
        // Filter out and delete any caches that are not the current one.
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
        // self.clients.claim() allows an active service worker to set itself as the
        // controller for all clients within its scope.
        return self.clients.claim();
    })
  );
});

// --- 3. Fetch and Serve from Cache (Offline Support) ---
// This event is fired for every network request the page makes.
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  // For navigation requests (i.e., for HTML pages), we use a network-first strategy.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // First, try to fetch the page from the network.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // If the network request fails (e.g., offline), show the offline page.
          console.log('Service Worker: Fetch failed; returning offline page.');
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })()
    );
    return;
  }
  
  // For other requests (CSS, JS, images), we use a cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the response is in the cache, return it.
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If it's not in the cache, fetch it from the network.
        return fetch(event.request).then((networkResponse) => {
           // Optionally, you can add the new response to the cache for next time.
           // This is a "cache-on-demand" strategy.
           const responseToCache = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache);
           });
           return networkResponse;
        });
      })
  );
});


// --- 4. Push Notification Handler ---
// This event is fired when a push message is received.
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push Received.');
  
  let data = { title: 'New Notification', body: 'Something new happened!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Error parsing push data', e);
    }
  }

  const options = {
    body: data.body,
    icon: '/images/icons/icon-192x192.png',
    badge: '/images/icons/icon-96x96.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// This event is fired when a user clicks on the notification.
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked.');
  event.notification.close();
  // This opens the app to the root page. You can customize this to open a specific URL.
  event.waitUntil(
    self.clients.openWindow('/')
  );
});


// --- 5. Background Sync Handler ---
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-example') {
    console.log('Service Worker: Background sync event received!');
    // Here you would typically perform the action that was deferred
    // e.g., sending a form post to the server.
    event.waitUntil(
       console.log("Simulating sending data to server...")
    );
  }
});


// --- 6. Periodic Background Sync Handler ---
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-news') {
    console.log('Service Worker: Periodic sync event received!');
    // Here you would fetch new content and update the cache.
    event.waitUntil(
       console.log("Simulating fetching new data...")
    );
  }
});
