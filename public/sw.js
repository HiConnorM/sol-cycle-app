/**
 * Sol Cycle Service Worker — Cache-first strategy.
 *
 * Strategy:
 *   - On install: pre-cache the app shell (HTML, key assets).
 *   - On fetch: serve from cache first; fall back to network then offline page.
 *   - On activate: clean up old caches.
 *
 * This keeps the app fully functional offline without requiring a library.
 */

const CACHE_NAME = 'sol-cycle-v1'
const OFFLINE_URL = '/'

// Assets to pre-cache on install (the app shell).
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

// ---------- Install ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll(PRECACHE_URLS)
      self.skipWaiting()
    })()
  )
})

// ---------- Activate ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Delete caches from old versions.
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
      self.clients.claim()
    })()
  )
})

// ---------- Fetch ----------
self.addEventListener('fetch', (event) => {
  // Only handle GET requests over http(s).
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith('http')
  ) {
    return
  }

  // For navigation requests: network-first so users get fresh HTML,
  // fall back to cache / offline page.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(event.request)
          const cache = await caches.open(CACHE_NAME)
          cache.put(event.request, fresh.clone())
          return fresh
        } catch {
          const cached = await caches.match(event.request)
          if (cached) return cached
          // Last resort: return the cached home page.
          return (await caches.match(OFFLINE_URL)) || new Response('Offline', { status: 503 })
        }
      })()
    )
    return
  }

  // For all other requests (JS, CSS, images): cache-first.
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request)
      if (cached) return cached

      try {
        const fresh = await fetch(event.request)
        if (fresh.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(event.request, fresh.clone())
        }
        return fresh
      } catch {
        return new Response('Offline', { status: 503 })
      }
    })()
  )
})
