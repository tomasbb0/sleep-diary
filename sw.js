const CACHE_NAME = 'sleep-diary-v1';
const ASSETS = [
  '/sleep-diary/',
  '/sleep-diary/index.html',
  '/sleep-diary/styles.css',
  '/sleep-diary/app.js',
  '/sleep-diary/questions.js',
  '/sleep-diary/config.js',
  '/sleep-diary/manifest.json'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(e.request).then((fetchResponse) => {
        // Don't cache Firebase requests
        if (e.request.url.includes('firestore') || 
            e.request.url.includes('firebase') ||
            e.request.url.includes('googleapis')) {
          return fetchResponse;
        }
        
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.mode === 'navigate') {
        return caches.match('/sleep-diary/index.html');
      }
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
});
