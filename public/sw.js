const STATIC_CACHE = "ta-pwa-static-v2";
const PAGES_CACHE = "ta-pwa-pages-v2";
const MAX_CACHED_PAGES = 35;

const PRECACHE_URLS = [
  "/favicon.ico",
  "/favicon-96x96.png",
  "/apple-touch-icon.png",
  "/assets/icon-192.png",
  "/assets/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await Promise.all(
      keys.slice(0, keys.length - maxItems).map((req) => cache.delete(req))
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // NEVER intercept API calls or Next.js client-side RSC router / prefetch requests!
  if (
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1"
  ) {
    return;
  }

  // Cache-first ONLY for immutable hashed assets & icons
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/apple-touch-icon.png"
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-first ONLY for full HTML document navigations (offline tunnel fallback)
  if (
    request.mode === "navigate" &&
    (url.pathname.startsWith("/delhi-metro") ||
      url.pathname.startsWith("/rail/live-status"))
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, clone);
              trimCache(PAGES_CACHE, MAX_CACHED_PAGES);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return Response.error();
        })
    );
  }
});
