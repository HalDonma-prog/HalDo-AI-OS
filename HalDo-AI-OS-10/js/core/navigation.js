// ==========================================
// HalDo AI OS Professional 10.0
// Navigation Core System
// ==========================================


"use strict";



// Seiten Navigation

const HalDoNavigation = {


    openSystem: function () {

        console.log(
            "🚀 Starte HalDo AI OS Dashboard"
        );


        window.location.href = "dashboard.html";

    },



    openChat: function () {

        console.log(
            "💬 Öffne HalDo AI Chat"
        );


        window.location.href = "chat.html";

    },



    openSettings: function () {

        console.log(
            "⚙️ Öffne Einstellungen"
        );


        window.location.href = "settings.html";

    },



    goBack: function () {

        console.log(
            "⬅ Zurück"
        );


        window.location.href = "dashboard.html";

    }



};




// Globale Funktionen für HTML Buttons


window.openSystem = function () {

    HalDoNavigation.openSystem();

};



window.openChat = function () {

    HalDoNavigation.openChat();

};



window.openSettings = function () {

    HalDoNavigation.openSettings();

};



window.goBack = function () {

    HalDoNavigation.goBack();

};



// System bereit

console.log(
    "✅ HalDo AI Navigation Core geladen"
);