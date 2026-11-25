// Service Worker der Spielesammlung.
// Liefert alles aus dem Cache (läuft offline) und holt im Hintergrund die neueste Version.
// Updates erscheinen deshalb automatisch beim übernächsten Start, ohne dass hier etwas geändert werden muss.
const CACHE = 'spiele-v2';
const CORE = ['./', 'index.html', 'manifest.json', 'games.json', 'lib.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    try {
      const games = await (await fetch('games.json', { cache: 'no-store' })).json();
      await cache.addAll(games.flatMap(g => [`${g.id}/`, `${g.id}/icon.svg`]));
    } catch (err) { /* Spiele werden dann beim ersten Öffnen gecacht */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || new Response('Offline', { status: 503 });
  })());
});
