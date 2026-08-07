/*
========================================

HalDo AI OS 18
Main Menu Controller

Version:
18.0.0

User Interface Navigation

========================================
*/



function openDashboard(){


    window.location.href =
    "dashboard.html";


}





function openAI(){


    showMessage(
        "🤖 AI Core wird vorbereitet..."
    );


    if(
        typeof AICore !== "undefined"
    ){


        console.log(
            "🤖 AI Core verfügbar"
        );


    }



}





function openModules(){


    showMessage(
        "🧩 Module System geöffnet..."
    );


    if(
        typeof ModuleManager !== "undefined"
    ){


        console.log(
            ModuleManager.getModules()
        );


    }



}





function openApps(){


    showMessage(
        "📱 App System wird geladen..."
    );


}





function openSettings(){


    showMessage(
        "⚙️ Einstellungen vorbereitet..."
    );


}





function showSystemStatus(){


    if(
        typeof SystemStatus !== "undefined"
    ){


        console.log(
            SystemStatus.getStatus()
        );


    }



    showMessage(
        "📡 System Status aktualisiert"
    );


}





function showMessage(message){


    const element =
    document.getElementById(
        "app-container"
    );



    if(element){


        element.innerHTML =
        message;


    }



    console.log(
        message
    );


}





console.log(
    "🚀 HalDo Hauptmenü geladen"
);