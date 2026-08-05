/*
========================================
HalDo AI OS Professional 16.0

Settings Controller

========================================
*/


"use strict";





function loadSettings(){



    console.log(

        "⚙️ Einstellungen gestartet"

    );






    updateSystemInfo();



    updateStorageInfo();



}









function updateSystemInfo(){



    const infoBox =

    document.getElementById(

        "system-info"

    );






    if(!infoBox){


        return;


    }






    if(window.HalDoSystem){



        const info =

        HalDoSystem.info();






        infoBox.innerHTML =



        "🤖 Name: " +

        info.name +

        "<br>" +

        "📦 Version: " +

        info.version +

        "<br>" +

        "🟢 Status: " +

        info.status;



    }

    else {



        infoBox.innerHTML =


        "⚠️ System nicht verfügbar";



    }



}









function updateStorageInfo(){



    const storageBox =

    document.getElementById(

        "storage-info"

    );






    if(!storageBox){


        return;


    }






    if(window.HalDoStorage){



        storageBox.innerHTML =


        "💾 Speicher bereit";



    }

    else {



        storageBox.innerHTML =


        "⚠️ Speicher nicht geladen";



    }



}









function changeTheme(){



    if(window.HalDoStorage){



        HalDoStorage.save(

            "theme",

            "dark"

        );



    }






    alert(

        "🌙 Dark Mode gespeichert"

    );



}









function changeLanguage(){



    if(window.HalDoStorage){



        HalDoStorage.save(

            "language",

            "de"

        );



    }






    alert(

        "🌍 Deutsch gespeichert"

    );



}









document.addEventListener(

    "DOMContentLoaded",

    loadSettings

);