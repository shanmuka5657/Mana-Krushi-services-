const CACHE_NAME = 'mana-krushi-cache-v2';
const urlsToCache = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical assets here, like a logo
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});


// Listen for requests
self.addEventListener('fetch', event => {
    // We only want to intercept navigation requests
    if (event.request.mode !== 'navigate') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Check if we received a valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                const responseToCache = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                // Network request failed, try to get it from the cache.
                return caches.match(event.request)
                    .then(response => {
                        // If we have a cached response, return it
                        if (response) {
                            return response;
                        }
                        // If the request is for an HTML page and it's not in the cache, show the offline page.
                        if (event.request.headers.get('accept')?.includes('text/html')) {
                            return caches.match('/offline.html');
                        }
                    });
            })
    );
});
