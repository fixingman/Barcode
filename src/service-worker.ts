// Service Worker for Barcode PWA
// Handles offline functionality, caching, and app updates
/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'barcode-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event: cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(ASSETS_TO_CACHE);
        // Skip waiting - activate immediately
        (self as any).skipWaiting();
      } catch (error) {
        console.error('Cache installation failed:', error);
      }
    })()
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
      // Claim all clients immediately
      (self as any).clients.claim();
    })()
  );
});

// Fetch event: cache-first strategy for assets, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external domains
  if (url.origin !== location.origin) {
    return;
  }

  // For HTML, CSS, JS, JSON - use cache-first strategy
  if (
    request.destination === 'document' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.url.includes('.js') ||
    request.url.includes('.css') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(
      (async () => {
        try {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match(request);

          if (cached) {
            return cached;
          }

          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.add(request);
            return response;
          }

          return cached || response;
        } catch (error) {
          console.error('Fetch failed:', error);
          // Return a basic offline page if available
          const cached = await caches.match(request);
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // For other requests (images, fonts), use stale-while-revalidate
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);

        const fetchPromise = fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            cache.put(request, clone);
          }
          return response;
        });

        return cached || fetchPromise;
      } catch (error) {
        console.error('Fetch error:', error);
        return (await caches.match(request)) || new Response('Offline', { status: 503 });
      }
    })()
  );
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    (self as any).skipWaiting();
  }
});

export {};
