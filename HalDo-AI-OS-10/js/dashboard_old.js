/*
========================================
HalDo AI OS Professional 16.0

Dashboard Controller

========================================
*/


"use strict";





function loadDashboard(){



    console.log(

        "📊 Dashboard wird geladen..."

    );






    const status =

    document.getElementById(

        "dashboard-status"

    );






    if(status){



        if(window.HalDoSystem){



            const info =

            HalDoSystem.info();





            status.innerHTML =


            "🟢 " +

            info.status +

            " | Module: " +

            info.modules.length;



        }

        else {



            status.innerHTML =


            "🟡 Core nicht geladen";


        }



    }






    const systemName =

    document.getElementById(

        "system-name"

    );






    if(systemName && window.HalDoConfig){



        systemName.innerHTML =


        HalDoConfig.system.name;



    }



}









document.addEventListener(

    "DOMContentLoaded",

    loadDashboard

);