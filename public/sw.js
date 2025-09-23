// A basic service worker for caching assets and enabling offline functionality.

const CACHE_NAME = 'mana-krushi-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/offline',
  '/login',
  '/signup',
  '/dashboard?role=passenger',
  '/dashboard?role=owner',
  '/globals.css'
];

// Install a service worker
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT: Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT: Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                ).catch(function() {
                    // If the fetch fails (e.g., user is offline), return the offline page.
                    return caches.match('/offline');
                });
            })
    );
});


// Update a service worker
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
    })
  );
});

// PUSH NOTIFICATION
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Mana Krushi Services';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// BACKGROUND SYNC
self.addEventListener('sync', function(event) {
  if (event.tag == 'background-sync-example') {
    event.waitUntil(
        // Perform some background task
        console.log('Background sync successful!')
    );
  }
});

// PERIODIC SYNC
self.addEventListener('periodicsync', function(event) {
  if (event.tag == 'periodic-sync-example') {
    event.waitUntil(
        // Perform some periodic background task
        console.log('Periodic sync successful!')
    );
  }
});
