const STATIC_CACHE = "static-v7"
const FILES_TO_CACHE = [
  "/",
  "index.html",
  "main.js",
  "style.css",
  "./assets/gameImgs/flappy_card.png",
  "./assets/gameImgs/grass.png",
  "./assets/gameImgs/land.png",
  "./assets/gameImgs/tree.png",
  "./assets/icons/favicon-16x16.png",
  "./assets/icons/favicon-32x32.png",
  "./assets/fonts/Electrolize-Regular.ttf",
  "./assets/sounds/bgm1.mp3",
]

self.addEventListener("install", e => {
  // console.log("installed", e)
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        cache.addAll(FILES_TO_CACHE)
      })
  )
})

self.addEventListener("activate", e => {
  console.log("activated", e)
  e.waitUntil(
    caches.keys().then(
      keylist =>
        Promise.all(
          keylist.map(key => {
            if (key !== STATIC_CACHE) caches.delete(key)
          })
        )
    ))
})

self.addEventListener("fetch", e => {
  // console.log("fetched", e)
  e.respondWith(
    caches.match(e.request)
      .then(response => {
        if (response) return response
        else return fetch(e.request)
      })
  )
})