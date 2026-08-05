// ==========================================
// HalDo AI OS Professional 10.0
// Service Worker
// ==========================================


const CACHE_NAME = "haldo-ai-os-10-cache";


const FILES_TO_CACHE = [

    "index.html",
    "dashboard.html",
    "chat.html",
    "settings.html",

    "css/main.css",

    "js/core/system.js",
    "js/core/navigation.js"

];




// Installation

self.addEventListener(
    "install",
    function(event){


        event.waitUntil(

            caches.open(CACHE_NAME)
            .then(function(cache){

                return cache.addAll(FILES_TO_CACHE);

            })

        );


    }
);




// Dateien laden

self.addEventListener(
    "fetch",
    function(event){


        event.respondWith(

            caches.match(event.request)
            .then(function(response){


                return response || fetch(event.request);


            })

        );


    }
);