/*
========================================
HalDo AI OS Professional 16.0

Dashboard Controller

========================================
*/


"use strict";





function loadDashboard(){



    console.log(

        "📊 Dashboard gestartet"

    );







    updateSystemInfo();



    updateModuleList();



}









function updateSystemInfo(){



    const status =

    document.getElementById(

        "dashboard-status"

    );






    if(!status){


        return;


    }






    if(window.HalDoSystem){



        const info =

        HalDoSystem.info();






        status.innerHTML =



        "🟢 " +

        info.status +

        "<br>" +

        "Module: " +

        info.modules.length;



    }

    else {



        status.innerHTML =


        "🔴 System nicht verbunden";



    }



}









function updateModuleList(){



    const list =

    document.getElementById(

        "module-list"

    );






    if(!list){


        return;


    }






    if(window.HalDoSystem){



        const modules =

        HalDoSystem.modules;






        list.innerHTML = "";






        modules.forEach(

            module => {



                const item =

                document.createElement(

                    "p"

                );





                item.innerHTML =



                "✅ " + module;






                list.appendChild(

                    item

                );



            }

        );



    }

    else {



        list.innerHTML =


        "Keine Module gefunden";



    }



}









document.addEventListener(

    "DOMContentLoaded",

    loadDashboard

);