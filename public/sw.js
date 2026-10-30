// Lets Chrome on Android install the app, and lets it open with no signal.
// Network first: online, every request goes to the network, so the phone always
// gets the latest version (both phones need the same one, see ARCHITECTURE.md).
// The cache is only used when the network fails. Only registered in production
// builds (see main.tsx), since in dev Vite serves modules that must never be cached.
// The build fills these in (see vite.config.ts): a cache for each version, and every
// file in the app, saved on install so the app opens offline after a single visit.
const CACHE = 'decrypto-dev';
const PRECACHE = [];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Straight from the network, not the browser's own cache, so it's all one version
    await cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    // Older versions' files, so they don't pile up or get mixed with this version's offline
    for (const key of await caches.keys()) {
      if (key !== CACHE) await caches.delete(key);
    }
    await clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Every page is the same app, so pages (even with ?join=CODE) are cached as '/'
  const key = e.request.mode === 'navigate' ? '/' : e.request;
  e.respondWith((async () => {
    try {
      const response = await fetch(e.request);
      if (response.ok) {
        const copy = response.clone();
        e.waitUntil(caches.open(CACHE).then((cache) => cache.put(key, copy)));
      }
      return response;
    } catch (error) {
      // The files saved on install were fetched without the Origin header that module scripts and stylesheets send, so
      // a Vary: Origin on the response mustn't stop them matching
      const hit = await caches.match(key, { ignoreVary: true });
      if (hit) return hit;
      throw error;
    }
  })());
});
