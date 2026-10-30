// Lets Chrome on Android install the app, and lets it open with no signal.
// Network first: online, every request goes to the network, so the phone always
// gets the latest version (both phones need the same one, see ARCHITECTURE.md).
// The cache is only used when the network fails. Only registered in production
// builds (see main.tsx), since in dev Vite serves modules that must never be cached.
const CACHE = 'decrypto-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
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
      const hit = await caches.match(key);
      if (hit) return hit;
      throw error;
    }
  })());
});
