// ==========================================
// HalDo AI OS Professional 10.0
// Navigation Core
// ==========================================


"use strict";



const HalDoNavigation = {



    goTo: function(page){


        console.log(
            "➡️ Navigation:",
            page
        );


        window.location.href = page;


    },





    dashboard: function(){


        this.goTo(
            "dashboard.html"
        );


    },





    chat: function(){


        this.goTo(
            "chat.html"
        );


    },





    settings: function(){


        this.goTo(
            "settings.html"
        );


    }





};






// Globale Verbindung für HTML Buttons


window.openSystem = function(){


    HalDoNavigation.dashboard();


};



window.openChat = function(){


    HalDoNavigation.chat();


};



window.openSettings = function(){


    HalDoNavigation.settings();


};





window.HalDoNavigation = HalDoNavigation;



console.log(
    "✅ Navigation Core geladen"
);