const CACHE_NAME = 'offline-v1';
const OFFLINE_PAGE = '/offline.html';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  OFFLINE_PAGE,
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
];

// Instalar: cacheia recursos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ESSENTIAL_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Ativar: remove caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Interceptar: mostra página offline quando não há conexão
self.addEventListener('fetch', (event) => {
  // Só intercepta navegação de páginas
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_PAGE))
    );
  }
});