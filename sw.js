// SmartPrice Comparator — Service Worker
// Versió de la caché — canvia aquest número per forçar l'actualització
const CACHE_NAME = 'smartprice-v2';

// Fitxers que es guarden per funcionar offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/views/inici.html',
  '/views/pressupost.html',
  '/views/comparador.html',
  '/views/assessor.html',
  '/views/login.html',
  '/views/register.html',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Instal·lació: guarda tots els assets a la caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activació: esborra cachés antigues
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: serveix des de caché si disponible, si no fa la petició a la xarxa
self.addEventListener('fetch', (event) => {
  // Ignora peticions que no siguin GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si està a la caché, retorna'l
      if (cachedResponse) {
        return cachedResponse;
      }
      // Si no, va a la xarxa i guarda una còpia a la caché
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si no hi ha xarxa i no està a la caché, mostra el index com a fallback
        return caches.match('/index.html');
      });
    })
  );
});
