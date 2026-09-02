/**
 * NearDrop Service Worker
 * Provides PWA install support, offline shell caching,
 * and Web Share Target file handling.
 */

const CACHE_NAME = "neardrop-shell-v1";
const SHELL_URLS = [
  "/",
  "/dashboard",
  "/files",
  "/transfers",
];

// Install: cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_URLS).catch(() => {
        // Some URLs may fail in dev, that's ok
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first with shell fallback
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests (except share target POST)
  if (request.method === "POST" && request.url.includes("/dashboard")) {
    // Web Share Target handler
    event.respondWith(
      (async () => {
        const formData = await request.formData();
        const files = formData.getAll("shared_files");

        // Store shared files in a temporary cache for the client to pick up
        if (files.length > 0) {
          const cache = await caches.open("neardrop-share-target");
          const fileData = [];
          for (const file of files) {
            if (file instanceof File) {
              fileData.push({
                name: file.name,
                type: file.type,
                size: file.size,
              });
            }
          }
          // Store metadata — actual file handling happens client-side
          await cache.put(
            new Request("/_share_target_files"),
            new Response(JSON.stringify(fileData), {
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        // Redirect to dashboard
        return Response.redirect("/dashboard?share_target=true", 303);
      })()
    );
    return;
  }

  if (request.method !== "GET") return;

  // For navigation requests, try network first, fallback to cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/dashboard");
        });
      })
    );
    return;
  }

  // For other requests, network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
