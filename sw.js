// Service Worker for ร้านน้ำปั่น POS
// This file must sit in the SAME FOLDER as the POS html file on GitHub Pages.
// It lets Android Chrome offer "Add to Home Screen / Install app", and lets the
// app keep working (loading its own shell) even with a flaky connection.
// All real data still lives in the browser's localStorage on the phone, not here.

const CACHE_NAME = 'smoothie-pos-v1';
// cache the current page itself so it can reopen even if offline
const APP_SHELL = [self.registration.scope];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(()=>{})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// cache-first for our own page, network for everything else (fonts, etc.)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const isAppShell = event.request.mode === 'navigate' || APP_SHELL.includes(event.request.url);
  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
