// service-worker.js

const CACHE_NAME = 'anyokaeats-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-anyokaeats-cache-v1'; // Separate cache for dynamic content
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',  // Include the offline fallback page
  '/static/css/main.906fc640.css',  // Main CSS file
  '/static/js/main.f04821ac.js',     // Main JS file
  '/static/js/453.419a5d54.chunk.js', // Additional JS chunk
  // Static media files
  '/static/media/deliveryPerason.3b96b56dbe5834ce381d.png',
  '/static/media/vegetables-concept-illustration.7571f50fe23caa92da00.png',
  '/static/media/cooking-people-colored-composition.cb90685ed19e17ae1ed9.png',
  '/static/media/abstract-star-burst-with-rays-flare.c24a5f3abc86bdcfa08e.png',
  '/static/media/service_Provider.f697144f347eb64b6565.png',
  '/static/media/flying-fried-chicken-with-bucket-cartoon.89ae7d3b506166da3b3e.png',
  '/static/media/people-business-meeting-office-conference-room-concept-teamwork-communication-company-brainstorming-discussion-team-vector-flat-illustration-people-with-speech-bubbles.4a52a1c9b99a838c751f.png',
  '/static/media/mzeepassport.567aa069693eb8a4cfae.JPG',
  '/static/media/userPerson.264274c382100c90bbfb.png',
  '/static/media/delivery-boy-picks-up-parcel-from-online-store-sending-customer-with-location-application-by-motorcycle-vector-illustration.4b32e726a1d32951cf59.png',
  '/static/media/fa-solid-900.bacd5de623fb563b961a.ttf',
  '/static/media/fa-brands-400.60127e352b7a11f7f1bc.ttf',
  '/static/media/fa-solid-900.4d986b00ff9ca3828fbd.woff2',
  '/static/media/Eliud.3154b7641209e298c81d.jpg',
  '/static/media/fa-brands-400.455ea818179b4def0c43.woff2',
  '/static/media/fa-regular-400.eb91f7b948a42799f678.ttf',
  '/static/media/foodstocks.efacb0d0939f1de98e12.jpg',
  '/static/media/carrots.c7c4d81f991e71466b76.jpg',
  '/static/media/fa-regular-400.21cb8f55d8e0c5b89751.woff2',
  '/static/media/fa-v4compatibility.c8e090db312b0bea2aa2.ttf',
  '/static/media/fa-v4compatibility.cf7f5903d06b79ad60f1.woff2',
  '/static/css/main.906fc640.css.map', // Source map (optional)
  '/static/js/main.f04821ac.js.map',  // Source map (optional)
  '/static/js/453.419a5d54.chunk.js.map' // Source map (optional)
];


// Install event - cache static files
self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.error('Caching failed:', error);
        });
      })
    );
  });
  
  // Activate event - clear old caches and manage cache updates
  self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME, DYNAMIC_CACHE_NAME]; // Whitelist current cache names
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName); // Delete old caches
            }
          })
        );
      })
    );
  });
  
  // Fetch event - cache dynamic content (API responses) and manage fallback
  self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
  
    // Handle navigation requests (e.g., HTML pages)
    if (event.request.mode === 'navigate') {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).catch(() => caches.match('/offline.html')); // Fallback to offline.html
        })
      );
    } 
    // Cache API requests (like fetching products)
    else if (requestUrl.pathname.startsWith('/api/')) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse; // Serve cached response if available
          }
          return fetch(event.request).then((networkResponse) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              limitCacheSize(DYNAMIC_CACHE_NAME, 50); // Limit dynamic cache size
              return networkResponse;
            });
          }).catch(() => {
            // If the fetch fails, serve the offline page
            return caches.match('/offline.html');
          });
        })
      );
    } 
    // For other assets (CSS, JS, images)
    else {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request).then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
  
            // Clone the response so we can cache it
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
  
            return networkResponse;
          });
        })
      );
    }
  });
  
  // Function to limit the number of items in the dynamic cache
  function limitCacheSize(cacheName, maxItems) {
    caches.open(cacheName).then((cache) => {
      cache.keys().then((keys) => {
        if (keys.length > maxItems) {
          cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems)); // Recursively delete oldest entries
        }
      });
    });
  }