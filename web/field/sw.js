// AJI field app: keeps the app itself on the phone so it opens without a network
const V = 'aji-field-v106', LIB = 'aji-lib-1';
const FILES = ['./', './index.html', './app.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== LIB).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;   // the program's server and Drive photos go to the network
  // the app page: network first (to get updates), the saved copy when offline
  if (e.request.mode === 'navigate') { const page = /app\.html$/.test(u.pathname) ? './app.html' : './index.html';
    e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(V).then(x => x.put(page, c)); } return r; }).catch(() => caches.match(page))); return; }
  // محوّل PDF (pdf.js) كبير ولا يتغير: يُحفظ عند أول طلب في خزانة مستقلة لا تُمسح مع تحديث التطبيق، فيعمل بلا شبكة
  if (/\/(pdf(\.worker)?\.min\.js|leaflet\.(js|css))$/.test(u.pathname)) { e.respondWith(caches.open(LIB).then(c => c.match(e.request).then(r => r || fetch(e.request).then(x => { if (x.ok) c.put(e.request, x.clone()); return x; })))); return; }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
