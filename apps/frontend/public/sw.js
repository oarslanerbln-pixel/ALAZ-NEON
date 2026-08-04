// MediSade app-shell service worker.
//
// Scope: basic installability + "the last page I looked at still opens offline".
// Deliberately NOT a full Workbox/Serwist-style runtime-caching setup — this project
// builds with Turbopack, which neither next-pwa nor Serwist currently integrate with
// cleanly, so this is a small hand-written cache-first-with-network-fallback worker
// instead. Bump CACHE_NAME whenever APP_SHELL changes so old caches get cleaned up.
const CACHE_NAME = 'medisade-shell-v1';

const APP_SHELL = [
  '/',
  '/login',
  '/register',
  '/medications',
  '/scan',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin GET requests: leave cross-origin calls (the backend API,
  // tesseract.js's CDN-hosted language data/worker scripts) and non-GET requests
  // (POST/PATCH/DELETE to the API) to the network as usual.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => undefined);

      return cached || (await networkFetch) || Response.error();
    })
  );
});
