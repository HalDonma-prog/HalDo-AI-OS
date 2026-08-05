/*
========================================
HalDo AI OS Professional 16.0

Navigation Controller

========================================
*/


"use strict";





function openPage(page){



    if(!page){


        return;


    }





    console.log(

        "➡️ Öffne Seite:",

        page

    );






    if(window.HalDoLogger){



        HalDoLogger.info(

            "Navigation zu: " + page

        );


    }






    window.location.href = page;



}









function goHome(){



    openPage(

        "index.html"

    );



}









function goDashboard(){



    openPage(

        "dashboard.html"

    );



}









function goChat(){



    openPage(

        "chat.html"

    );



}









function goSettings(){



    openPage(

        "settings.html"

    );



}