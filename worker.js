/* =====================================
   HALDO AI OS v2.0
   MASTER SERVICE WORKER
===================================== */


const CACHE_NAME =
"haldo-ai-os-v2-master";



const CORE_FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./script.js",

    "./manifest.json",

    "./haldo-logo.png"

];









/* =====================================
   INSTALL SYSTEM
===================================== */


self.addEventListener(

"install",

event => {


console.log(

"💙 HalDo Service Worker installiert"

);



event.waitUntil(

caches.open(
CACHE_NAME
)

.then(
cache => {


return cache.addAll(
CORE_FILES
);


})

);



self.skipWaiting();


}

);









/* =====================================
   ACTIVATE SYSTEM
===================================== */


self.addEventListener(

"activate",

event => {



console.log(

"🚀 HalDo Service Worker aktiviert"

);



event.waitUntil(

caches.keys()

.then(

keys => {


return Promise.all(

keys.map(

key => {


if(

key !== CACHE_NAME

){


return caches.delete(
key
);


}


})

);


})

);



self.clients.claim();


}

);









/* =====================================
   FETCH SYSTEM
===================================== */


self.addEventListener(

"fetch",

event => {



event.respondWith(

caches.match(

event.request

)

.then(

response => {



return response ||

fetch(

event.request

)

.then(

networkResponse => {



return caches.open(

CACHE_NAME

)

.then(

cache => {



cache.put(

event.request,

networkResponse.clone()

);



return networkResponse;


});


});


})

);


}

);









/* =====================================
   UPDATE MESSAGE SYSTEM
===================================== */


self.addEventListener(

"message",

event => {



if(

event.data ===

"UPDATE"

){


self.skipWaiting();


}



});









/* =====================================
   HALDO CLOUD PREPARATION ☁️
===================================== */


const HalDoCloudWorker = {


status:

"prepared",



sync(){


console.log(

"☁️ Cloud Sync vorbereitet"

);


}


};



console.log(

"🤖 HalDo AI OS Service Worker v2.0 READY"

);