/*
====================================

HalDo AI OS 18
Startup Controller

Professional Ultimate Foundation

Version:
18.0.0

====================================
*/


function startHalDoOS(){



    const startup =
    document.getElementById(
        "startup-screen"
    );



    const welcome =
    document.getElementById(
        "welcome-screen"
    );



    const message =
    document.getElementById(
        "startup-message"
    );




    if(!startup){

        return;

    }






    setTimeout(()=>{


        if(message){

            message.innerHTML =
            "🟡 HalDo AI OS wird gestartet...";

        }



    },1000);







    setTimeout(()=>{


        if(message){

            message.innerHTML =
            "🔵 Systemmodule werden geladen...";

        }



    },2500);







    setTimeout(()=>{


        if(message){

            message.innerHTML =
            "🟢 System bereit";

        }



    },4000);







    setTimeout(()=>{


        startup.classList.add(
            "hidden"
        );



        if(welcome){


            welcome.classList.remove(
                "hidden"
            );


        }




    },5500);





}







window.addEventListener(
"load",
()=>{


    startHalDoOS();


});