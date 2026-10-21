// Quintal da Mata — guarda o app no celular para abrir sem internet
const VERSAO = 'viveiro-v12';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png',

  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js',
  'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSAO).then(c => Promise.all(ARQUIVOS.map(u => c.add(new Request(u, {mode: u.startsWith('http') ? 'cors' : 'same-origin'})).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.hostname.endsWith('google.com') || u.hostname.endsWith('googleusercontent.com')) return; // planilha e fotos: sempre pela internet
  // páginas do app: tenta a internet primeiro (para pegar atualizações), cai no cache se estiver offline
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSAO).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (u.origin === location.origin || u.hostname.includes('jsdelivr') || u.hostname.includes('fonts.g'))) { const c = r.clone(); caches.open(VERSAO).then(x => x.put(e.request, c)); }
    return r;
  }).catch(() => hit)));
});
