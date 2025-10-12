// sw.js - Hardened Version

const CACHE_NAME = 'alert-jar-cache-v3.3'; // Bump the version name
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Add paths to your icons here, e.g., './icons/icon-192x192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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

// --- MODIFIED (Solution 2) ---
// This is the critical change. It intercepts all network requests
// and tells the service worker to IGNORE requests to Google's domains.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache or intercept Google API or auth calls.
  // Let the browser handle these directly to ensure the latest versions are used.
  if (url.hostname === 'apis.google.com' || 
      url.hostname === 'accounts.google.com' ||
      url.hostname === 'www.googleapis.com' ||
      url.hostname === 'people.googleapis.com' ||
      url.hostname === 'www.gstatic.com') {
    // By returning without calling event.respondWith, we let the request
    // go directly to the network, bypassing the service worker completely.
    return;
  }

  // For all other requests, use the standard cache-first strategy.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request); // Fetch from network
      })
  );
});

// Listener for the "skipWaiting" message from the main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
