/*
========================================
HalDo AI OS Professional 16.0

Navigation Controller

========================================
*/

"use strict";





const HalDoNavigation = {



    open(page){



        if(!page){


            return false;


        }





        if(window.HalDoLogger){


            HalDoLogger.info(

                "Navigation: " + page

            );


        }





        window.location.href = page;



        return true;



    }






};







function openPage(page){



    return HalDoNavigation.open(

        page

    );


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







window.HalDoNavigation = HalDoNavigation;