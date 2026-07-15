const CACHE_NAME = 'livraria-plus-pdfs';
const R2_HOST = 'r2.dev';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isPdf =
    (url.pathname.startsWith('/api/livros/') && url.pathname.endsWith('.pdf')) ||
    (url.hostname.endsWith(R2_HOST) && url.pathname.endsWith('.pdf'));

  if (isPdf) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const response = await fetch(event.request);
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch {
          return new Response('Offline', { status: 503 });
        }
      })
    );
  }
});
