const CACHE_NAME = 'simple-offline-v1';
const OFFLINE_PAGE = '/offline.html';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  OFFLINE_PAGE,
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
];

// Função para verificar se uma URL pode ser cacheada
function isCacheableRequest(request) {
  const url = new URL(request.url);
  
  // Só permite http e https
  if (!['http:', 'https:'].includes(url.protocol)) {
    return false;
  }
  
  // Evita cachear requests de extensões
  if (url.protocol === 'chrome-extension:' || 
      url.protocol === 'moz-extension:' || 
      url.protocol === 'safari-extension:') {
    return false;
  }
  
  // Evita cachear requests para outros domínios (opcional)
  if (url.origin !== self.location.origin) {
    return false;
  }
  
  return true;
}

// Instalar: cacheia recursos essenciais
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando recursos essenciais');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: Instalação completa');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro na instalação:', error);
      })
  );
});

// Ativar: remove caches antigos de forma mais eficiente
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Ativando...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('Service Worker: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Ativação completa');
        return self.clients.claim();
      })
  );
});

// Interceptar: estratégia Network First com fallback otimizado
self.addEventListener('fetch', (event) => {
  // Ignora requests que não podem ser cacheados
  if (!isCacheableRequest(event.request)) {
    console.log('Service Worker: Ignorando request não cacheável:', event.request.url);
    return; // Deixa o request passar normalmente
  }
  
  // Só intercepta navegação de páginas (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request, {
        // Otimização: Timeout para evitar espera excessiva
        signal: AbortSignal.timeout(5000)
      })
      .then(response => {
        // Se a resposta for OK, pode cachear a página atual
        if (response.ok && isCacheableRequest(event.request)) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseClone))
            .catch(error => console.log('Erro ao cachear:', error));
        }
        return response;
      })
      .catch(() => {
        console.log('Service Worker: Usando página offline');
        return caches.match(OFFLINE_PAGE);
      })
    );
  }
  
  // Otimização: Cache para assets estáticos (CSS, JS, imagens)
  else if (event.request.destination === 'style' || 
           event.request.destination === 'script' || 
           event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              if (response.ok && isCacheableRequest(event.request)) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(event.request, responseClone))
                  .catch(error => console.log('Erro ao cachear:', error));
              }
              return response;
            });
        })
    );
  }
});