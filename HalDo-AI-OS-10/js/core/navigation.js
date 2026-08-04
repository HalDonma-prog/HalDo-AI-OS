// ==========================================
// HalDo AI OS Professional 10.0
// Navigation Core
// ==========================================



const HalDoNavigation = {



    // Startseite zum Dashboard

    openSystem: function(){


        console.log(
            "🚀 Öffne HalDo AI OS Dashboard"
        );


        window.location.href =
        "dashboard.html";


    },




    // Chat öffnen

    openChat: function(){


        console.log(
            "💬 Öffne HalDo AI Chat"
        );


        window.location.href =
        "chat.html";


    },





    // Einstellungen öffnen

    openSettings: function(){


        console.log(
            "⚙️ Öffne Einstellungen"
        );


        window.location.href =
        "settings.html";


    },





    // Zurück zum Dashboard

    goBack: function(){


        window.location.href =
        "dashboard.html";


    }



};





// Globale Funktionen für HTML Buttons


function openSystem(){

    HalDoNavigation.openSystem();

}



function openChat(){

    HalDoNavigation.openChat();

}



function openSettings(){

    HalDoNavigation.openSettings();

}



function goBack(){

    HalDoNavigation.goBack();

}