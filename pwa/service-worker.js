const CACHE_NAME = 'suatbuat-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/choose-type.html',
  '/lessons.html',
  '/lesson.html',
  '/styles.css',
  '/app.js',
  '/choose-type.js',
  '/lessons.js',
  '/lesson.js',
  '/data/paths.json',
  '/data/dhamma_quotes.json',
  '/data/mahanikai/monk/lessons.json',
  '/data/mahanikai/novice/lessons.json',
  '/data/dhammayut/monk/lessons.json',
  '/data/dhammayut/novice/lessons.json'
];

// Install — precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — Network First for JSON, Cache First for audio, Stale While Revalidate for the rest
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Audio files: Cache First
  if (url.pathname.startsWith('/audio/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 404, statusText: 'Audio not found' }));
      })
    );
    return;
  }

  // Everything else: Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// Message handler — download lesson audio for offline
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_AUDIO') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.allSettled(
          urls.map((u) => fetch(u).then((r) => {
            if (r.ok) return cache.put(u, r);
          }).catch(() => {}))
        );
      }).then(() => {
        self.clients.matchAll().then((clients) => {
          clients.forEach((c) => c.postMessage({ type: 'CACHE_DONE' }));
        });
      })
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
