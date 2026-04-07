const CACHE = 'ironlog-v2';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('anthropic.com') ||
      e.request.url.includes('fonts.googleapis.com') ||
      e.request.url.includes('cdnjs.cloudflare.com')) {
    return; // always network for these
  }
  e.respondWith(
    fetch(e.request).then(response => {
      const clone = response.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return response;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
