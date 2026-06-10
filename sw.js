/* INDO 2026 — offline service worker
   Strategy:
   - Page (navigations): network-first, falling back to the cached shell when offline.
     Every successful online load refreshes the cached copy, so deploys arrive normally.
   - CDN static assets (Leaflet, Firebase SDK, fonts): stale-while-revalidate.
   - Map tiles (CARTO + Esri): stale-while-revalidate, capped — recently viewed areas work offline.
   - Images (hotspot photos, uploaded files, Google place photos): cache-first, capped.
   - Google Maps JS API + Directions: network-only (the app degrades to estimates offline).
*/
const SHELL_CACHE   = "indo-shell-v1";
const RUNTIME_CACHE = "indo-runtime-v1";
const TILE_CACHE    = "indo-tiles-v1";
const KEEP = [SHELL_CACHE, RUNTIME_CACHE, TILE_CACHE];

const TILE_HOSTS   = ["basemaps.cartocdn.com", "server.arcgisonline.com"];
const STATIC_HOSTS = ["unpkg.com", "fonts.googleapis.com", "fonts.gstatic.com", "www.gstatic.com"];
const IMG_HOSTS    = ["firebasestorage.googleapis.com", "maps.googleapis.com", "lh3.googleusercontent.com", "lh5.googleusercontent.com"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(["./"])).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("indo-") && !KEEP.includes(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function trimCache(name, max) {
  try {
    const c = await caches.open(name);
    const keys = await c.keys();
    for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
  } catch (e) {}
}

async function cacheFirst(req, cacheName, max) {
  const hit = await caches.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === "opaque")) {
    const c = await caches.open(cacheName);
    c.put(req, res.clone());
    if (max) trimCache(cacheName, max);
  }
  return res;
}

async function staleWhileRevalidate(req, cacheName, max) {
  const c = await caches.open(cacheName);
  const hit = await c.match(req);
  const refresh = fetch(req).then(res => {
    if (res && (res.ok || res.type === "opaque")) {
      c.put(req, res.clone());
      if (max) trimCache(cacheName, max);
    }
    return res;
  }).catch(() => null);
  return hit || refresh.then(r => r || Response.error());
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  let url; try { url = new URL(req.url); } catch (err) { return; }

  // the app itself — network-first so updates land; cached shell when offline
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(SHELL_CACHE);
        c.put("./", fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match("./")) || Response.error();
      }
    })());
    return;
  }

  const host = url.hostname;

  if (TILE_HOSTS.some(h => host.endsWith(h))) {
    e.respondWith(staleWhileRevalidate(req, TILE_CACHE, 450));
    return;
  }

  // Maps JS API stays network-only; Places photos (destination "image") are cacheable
  if (req.destination === "image" && IMG_HOSTS.some(h => host.endsWith(h))) {
    e.respondWith(cacheFirst(req, RUNTIME_CACHE, 160));
    return;
  }

  if (STATIC_HOSTS.some(h => host.endsWith(h))) {
    e.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE, 80));
    return;
  }
  // everything else (Maps API script, Firebase RTDB/REST) → straight to the network
});
