// sw.js - Version 3.4

const CACHE_NAME = 'alert-jar-cache-v3.4';
// IMPORTANT: Make sure every file listed here actually exists in your repository.
// If you don't have an 'icons' folder, remove those lines.
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
  // Example: './icons/icon-192.png',
  // Example: './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Use individual 'add' calls which are more resilient than 'addAll'
        // 'addAll' fails if a single request fails.
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`Failed to cache ${urlToCache}:`, err);
            });
        });
        return Promise.all(cachePromises);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache or intercept Google API calls.
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleapis.com') || url.hostname.endsWith('gstatic.com')) {
    return; // Pass through to the network
  }

  // Cache-first strategy for app assets
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
