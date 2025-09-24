// A simple, no-op service worker that takes control of the page and does nothing.
// This is a placeholder that can be built upon.

self.addEventListener('install', () => {
  // Skip waiting so the new service worker takes control immediately.
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Take control of all pages under this service worker's scope immediately.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // This service worker doesn't intercept any fetch requests.
  // It will all go to the network as usual.
  return;
});
