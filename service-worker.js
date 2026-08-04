/*
=====================================
 HALDO AI OS PROFESSIONAL
 SERVICE WORKER
 Version 7.0 Foundation
=====================================
*/


const CACHE_NAME = "haldo-ai-os-v7";


const FILES_TO_CACHE = [

    "./",
    "./index.html",
    "./manifest.json"

];





// INSTALL SYSTEM

self.addEventListener(
"install",
event => {


    console.log(
        "💙 HalDo AI OS Service Worker installiert"
    );


    event.waitUntil(

        caches.open(
            CACHE_NAME
        )
        .then(
            cache => {

                return cache.addAll(
                    FILES_TO_CACHE
                );

            }
        )

    );


});







// ACTIVATE SYSTEM

self.addEventListener(
"activate",
event => {


    console.log(
        "🚀 HalDo AI OS Service Worker aktiv"
    );


});







// FETCH SYSTEM

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
                );


            }

        )

    );


});