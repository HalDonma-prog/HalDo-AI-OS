/*
========================================
HalDo AI OS Professional 16.0

Settings Controller

========================================
*/


"use strict";





function loadSettings(){



    console.log(

        "⚙️ Einstellungen geladen"

    );






    const info =

    document.getElementById(

        "system-info"

    );






    if(info && window.HalDoSystem){



        const data =

        HalDoSystem.info();






        info.innerHTML =



        "🤖 " +

        data.name +

        "<br>" +

        "Version: " +

        data.version +

        "<br>" +

        "Status: " +

        data.status;



    }



}









function changeTheme(){



    let theme = "dark";





    if(window.HalDoStorage){



        HalDoStorage.save(

            "theme",

            theme

        );



    }






    alert(

        "🌙 Dark Mode aktiviert"

    );



}









function changeLanguage(){



    let language = "de";






    if(window.HalDoStorage){



        HalDoStorage.save(

            "language",

            language

        );


    }






    alert(

        "🌍 Sprache gespeichert"

    );



}









document.addEventListener(

    "DOMContentLoaded",

    loadSettings

);