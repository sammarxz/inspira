const CACHE_NAME = "design-gallery-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/components/design-card.js",
  "/components/category-nav.js",
  "/components/modal.js",
  "/js/app.js",
  "/js/data-service.js",
  "/data/designs.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp)/)) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, fetchResponse.clone());
              return fetchResponse;
            });
          })
        );
      })
    );
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
