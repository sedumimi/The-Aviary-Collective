// Service Worker for The Aviary Collective
// Enables offline functionality and performance caching

const CACHE_NAME = 'aviary-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Images/PXL_20251111_074611687.RAW-02.ORIGINAL_1.webp',
  '/Images/PXL_20251111_075255720.RAW-02.ORIGINAL.webp',
  '/Images/PXL_20251111_081942305.RAW-02.ORIGINAL.webp',
  '/Images/PXL_20251114_071724544.RAW-02.ORIGINAL.webp',
  '/Images/PXL_20251114_071346434.RAW-02.ORIGINAL.webp',
  '/Images/PXL_20251114_072133511.RAW-02.ORIGINAL.webp',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Cache install error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached response if available
      if (response) {
        return response;
      }

      return fetch(event.request).then(response => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache successful responses
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Offline fallback - return a cached response or offline page
        return caches.match('/index.html');
      });
    })
  );
});
