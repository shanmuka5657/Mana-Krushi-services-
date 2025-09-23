// The version of the cache.
const CACHE_VERSION = 'v1';
// The name of the cache where app files will be stored.
const APP_CACHE = `mana-krushi-app-${CACHE_VERSION}`;
// The name of the cache for dynamic data, like API responses.
const DATA_CACHE = `mana-krushi-data-${CACHE_VERSION}`;

// A list of all the static files that make up the app shell.
const APP_SHELL_FILES = [
  '/',
  '/manifest.json',
  '/offline',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Note: Other JS/CSS/Image assets are cached automatically by the network-first strategy.
];

/**
 * Installation Event
 *
 * This event is triggered when the service worker is first installed.
 * It's used to pre-cache the essential files (the "app shell") that are
 * needed for the app to run offline.
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_CACHE).then((cache) => {
      console.log('[Service Worker] Pre-caching App Shell');
      // Add all the app shell files to the cache.
      // If any of the files fail to download, the installation will fail.
      return cache.addAll(APP_SHELL_FILES);
    })
  );
});

/**
 * Activation Event
 *
 * This event is triggered when the service worker is activated. This happens
 * after installation, or when a new version of the service worker replaces an old one.
 * It's the perfect place to clean up old caches.
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          // Delete any caches that are not the current app or data cache.
          if (key !== APP_CACHE && key !== DATA_CACHE) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});


/**
 * Fetch Event
 *
 * This event is triggered for every network request made by the page.
 * It allows the service worker to intercept the request and decide how to respond.
 * This is the core of the offline-first strategy.
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    // For API calls to Firestore or our AI flows, use a "network first" strategy.
    // This ensures we always try to get the freshest data.
    if (request.url.includes('/api/') || request.url.includes('firestore.googleapis.com')) {
        event.respondWith(
            caches.open(DATA_CACHE).then(async (cache) => {
                try {
                    // Try to fetch from the network first.
                    const response = await fetch(request);
                    // If successful, clone the response and store it in the data cache.
                    cache.put(request, response.clone());
                    return response;
                } catch (error) {
                    // If the network fails, try to serve the response from the cache.
                    console.log('[Service Worker] Network failed, serving from cache for:', request.url);
                    return await cache.match(request);
                }
            })
        );
    } else {
        // For all other requests (like pages, images, etc.), use a "cache first" strategy.
        event.respondWith(
            caches.match(request).then((response) => {
                // If the request is in the cache, return it.
                // Otherwise, fetch it from the network, cache it, and then return it.
                return response || fetch(request).then(networkResponse => {
                    return caches.open(APP_CACHE).then(cache => {
                        cache.put(request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                // If both the cache and network fail (e.g., completely offline and page not cached),
                // show the custom offline fallback page.
                if (request.mode === 'navigate') {
                    return caches.match('/offline');
                }
            })
        );
    }
});


/**
 * Periodic Background Sync Event (Educational Example)
 *
 * This is an example of running a task in the background. The browser will
 * trigger this event periodically (e.g., every few hours) to allow the app
 * to sync data in the background.
 *
 * To test this:
 * 1. Open Chrome DevTools.
 * 2. Go to the 'Application' tab.
 * 3. Select the 'Service Workers' pane.
 * 4. Find the 'Periodic Sync' section, enter 'get-promoted-rides', and click 'Register'.
 * 5. Click the 'Periodic Sync' button to trigger the event immediately for testing.
 */
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-promoted-rides') {
    console.log('[Service Worker] Starting background sync for promoted rides.');
    event.waitUntil(
      caches.open(DATA_CACHE).then(async (cache) => {
        try {
          // This is the endpoint that fetches promoted routes.
          // We fetch it and put the fresh data into our data cache.
          const request = new Request('/api/routes?promoted=true');
          const response = await fetch(request);
          console.log('[Service Worker] Promoted rides fetched in background, caching.');
          return cache.put(request, response);
        } catch (error) {
          console.error('[Service Worker] Background sync failed:', error);
        }
      })
    );
  }
});
