/*
========================================
HalDo AI OS Professional 16.0

Application Controller

========================================
*/


"use strict";





function startHalDo(){



    console.log(

        "🚀 HalDo AI OS 16.0 startet..."

    );





    if(window.HalDoSystem){



        HalDoSystem.init();



    }






    if(window.HalDoKernel){



        HalDoKernel.boot();



    }






    updateSystemStatus();



}









function updateSystemStatus(){



    const status =

    document.getElementById(

        "system-status"

    );






    if(status){



        status.innerHTML =


        "🟢 HalDo AI OS 16.0 läuft";



    }






    const dashboardStatus =

    document.getElementById(

        "dashboard-status"

    );






    if(dashboardStatus){



        dashboardStatus.innerHTML =


        "🟢 System aktiv";



    }



}









document.addEventListener(

    "DOMContentLoaded",

    startHalDo

);