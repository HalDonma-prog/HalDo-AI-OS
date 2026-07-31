const cacheName = "apps-web-3-v1";


const files = [

"index.html",
"style.css",
"script.js",
"manifest.json"

];


self.addEventListener("install", function(event){

event.waitUntil(

caches.open(cacheName)

.then(function(cache){

return cache.addAll(files);

})

);

});



self.addEventListener("fetch", function(event){

event.respondWith(

caches.match(event.request)

.then(function(response){

return response || fetch(event.request);

})

);

});
