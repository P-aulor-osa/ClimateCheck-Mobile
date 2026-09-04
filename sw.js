const CACHE_NAME = 'weather-app-v1';

const arqsToCache = [
    "index.html",
    "style.css",
    "manifest.json",
    "icons/icon-192.png",
    "icons/icon-512.png"
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(arqsToCache);
            })
    );
})

self.addEventListener("fetch", (evento) => {
    evento.respondWith(
        caches.match(evento.request)
            .then((respostaCache) => {
                return respostaCache || fetch(evento.request);
            })
    );
})