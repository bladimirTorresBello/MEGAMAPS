const CACHE = "megamaps-v7-admin-salones";
const ARCHIVOS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./assets/escudo.png",
  "./assets/logo_megamaps.png",
  "./assets/plano_piso1.jpg",
  "./assets/plano_piso2.jpg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia: cache primero, y si no está, va a la red y lo guarda para la próxima.
self.addEventListener("fetch", (e) => {
  const pathname = new URL(e.request.url).pathname;
  if (e.request.method !== "GET" || pathname.endsWith("/api.php") || pathname.endsWith("/guardar_foto.php")) return;
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copia));
          return res;
        }).catch(() => cached)
    )
  );
});
