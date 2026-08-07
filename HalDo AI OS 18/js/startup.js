window.addEventListener("load", function(){

    console.log("HalDo Startup geladen");


    setTimeout(function(){

        const startup =
        document.getElementById("startup-screen");


        const welcome =
        document.getElementById("welcome-screen");


        if(startup){

            startup.style.display = "none";

        }


        if(welcome){

            welcome.classList.remove("hidden");

        }


    },3000);


});