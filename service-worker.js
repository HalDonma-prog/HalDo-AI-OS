const cacheName="apps-web-3.0-v2";


const files=[

"index.html",
"style.css",
"script.js",
"manifest.json",
"icon.png"

];


self.addEventListener(
"install",
event=>{

event.waitUntil(

caches.open(cacheName)

.then(cache=>{

return cache.addAll(files);

})

);

});



self.addEventListener(
"fetch",
event=>{

event.respondWith(

caches.match(event.request)

.then(response=>{

return response || fetch(event.request);

})

);

});