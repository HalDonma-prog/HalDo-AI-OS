// ========================================
// HalDo AI OS 16
// Service Worker
// ========================================


const CACHE_NAME = "haldo-ai-os-16";


const FILES = [

"./",

"./index.html",
"./manifest.json"

];



self.addEventListener(
"install",
event => {


event.waitUntil(

caches.open(CACHE_NAME)

.then(

cache => cache.addAll(FILES)

)

);


}

);



self.addEventListener(
"activate",
event => {


event.waitUntil(

self.clients.claim()

);


}

);



self.addEventListener(
"fetch",
event => {


event.respondWith(

caches.match(event.request)

.then(

response => response || fetch(event.request)

)

);


}

);