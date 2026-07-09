// SeaSteps — prosty service worker (instalowalność PWA + offline fallback)
const CACHE = 'seasteps-v3'
const SHELL = ['/app/', '/app/index.html', '/app/manifest.webmanifest', '/app/favicon.svg', '/app/pwa-192.png', '/app/pwa-512.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  // czyści stare wersje cache (w tym poprzednio zatrutą v2 z odpowiedziami API)
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  // nawigacje: sieć, a offline -> cache (SPA)
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('/app/index.html').then((r) => r || caches.match('/app/'))))
    return
  }
  const url = new URL(req.url)
  // tylko własna powłoka SPA + zasoby Vite pod /app/ — nigdy API ani inne żądania cross-origin
  const isAppShell = url.origin === self.location.origin && url.pathname.startsWith('/app/')
  if (!isAppShell) {
    // np. /api/v1/me/stats, /leaderboard, /rewards (backend Rust), Supabase, Azure itd. —
    // brak przechwytywania, zawsze świeże dane z sieci
    return
  }
  // powłoka/assety: stale-while-revalidate — od razu z cache, w tle dociągamy świeższą wersję
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            c.put(req, res.clone()).catch(() => {})
            return res
          })
          .catch(() => cached)
        return cached || network
      }),
    ),
  )
})
