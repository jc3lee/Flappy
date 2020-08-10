const STATIC_CACHE = "static_cache"
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/main.js",
  "/style.css",
  "/flappy_card.png",
  "/grass.png",
  "/land.png",
  "/totoro1.svg",
  "/tree.png",
  "/icons/favicon-16x16.png",
  "/icons/favicon-32x32.png",
  "/Electrolize-Regular.ttf",
]

self.addEventListener("install", e => {
  console.log("installed", e)
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        cache.addAll(FILES_TO_CACHE)
      })
  )
})

self.addEventListener("activate", e => {
  console.log("activated", e)
})

self.addEventListener("fetch", e => {
  console.log("fetched", e)
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) return response
        else return fetch(e.request)
      })
  )
})