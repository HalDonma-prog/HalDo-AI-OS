/* =====================================
   HALDO AI OS
   SERVICE WORKER v2.1
   PWA FOUNDATION
===================================== */


const CACHE_NAME =

"haldo-ai-os-v2.1";





const FILES_TO_CACHE = [


    "./",

    "./index.html",

    "./dashboard.html",

    "./chat.html",

    "./settings.html",


    "./css/style.css",

    "./css/dashboard.css",

    "./css/chat.css",

    "./css/settings.css",


    "./js/script.js",

    "./js/ai-core.js",

    "./js/system.manager.js",

    "./js/files.js"


];





/*
   Installation
*/


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

            cache =>

            cache.addAll(
                FILES_TO_CACHE
            )

        )

    );


    self.skipWaiting();


});





/*
   Aktivierung
*/


self.addEventListener(

"activate",

event => {


    console.log(

        "🚀 HalDo Service Worker aktiv"

    );


    event.waitUntil(

        self.clients.claim()

    );


});





/*
   Dateien laden
*/


self.addEventListener(

"fetch",

event => {


    event.respondWith(


        caches.match(

            event.request

        )

        .then(

            response =>

            response ||

            fetch(
                event.request
            )


        )


    );


});





console.log(

"📱 HalDo AI OS Service Worker v2.1 READY"

);