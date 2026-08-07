window.addEventListener("load", function(){

    console.log("HalDo Startup funktioniert");


    const startup =
    document.getElementById("startup-screen");


    const welcome =
    document.getElementById("welcome-screen");


    if(startup){

        startup.style.display = "none";

    }


    if(welcome){

        welcome.style.display = "flex";

    }


});