
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
  // This is a basic pass-through fetch event listener.
  // In a real PWA, you would add caching strategies here.
  event.respondWith(fetch(event.request));
});
