const CACHE_STATIC = "static-v1";
const CACHE_IMAGES = "images-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/components/design-card.js",
  "/components/category-nav.js",
  "/components/modal.js",
  "/js/app.js",
  "/js/data-service.js",
  "/data/designs.json",
  "/images/logo.svg",
];

// Instalação: cache assets estáticos
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Força o novo service worker a ativar imediatamente

  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Remove caches antigos
            return (
              (cacheName.startsWith("static-") && cacheName !== CACHE_STATIC) ||
              (cacheName.startsWith("images-") && cacheName !== CACHE_IMAGES)
            );
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

// Estratégia de cache
self.addEventListener("fetch", (event) => {
  // Estratégia para imagens: Cache First com fallback para network
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Retorna do cache se existir
        if (response) {
          return response;
        }

        // Se não estiver no cache, busca na rede
        return fetch(event.request)
          .then((fetchResponse) => {
            // Armazena no cache de imagens
            if (fetchResponse.ok) {
              const clonedResponse = fetchResponse.clone();
              caches.open(CACHE_IMAGES).then((cache) => {
                cache.put(event.request, clonedResponse);
              });
            }
            return fetchResponse;
          })
          .catch(() => {
            // Se falhar, poderia retornar uma imagem placeholder
            return new Response("Image not available", { status: 404 });
          });
      })
    );
    return;
  }

  // Para outros recursos: Network First com fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a requisição for bem-sucedida, armazena no cache
        if (response.ok) {
          const clonedResponse = response.clone();
          caches.open(CACHE_STATIC).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
        }
        return response;
      })
      .catch(() => {
        // Se falhar, tenta buscar do cache
        return caches.match(event.request).then((cacheResponse) => {
          return (
            cacheResponse || new Response("Not available", { status: 404 })
          );
        });
      })
  );
});
