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



    if(!startup || !welcome){

        return;

    }






    setTimeout(()=>{


        startup.classList.add(
            "hidden"
        );



        welcome.classList.remove(
            "hidden"
        );



    },5500);





}






window.addEventListener(
"load",
()=>{


    startHalDoOS();


});