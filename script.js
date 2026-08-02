/* =====================================
   HALDO AI OS 10.0
   SCRIPT SYSTEM
   PART 1/8
===================================== */


/* =====================================
   HALDO CORE
===================================== */


const HalDo = {

    version: "10.0",

    name: "HalDo AI OS",

    ready: false,

    memory: {},


    start(){

        console.log(
            "🚀 HalDo AI OS gestartet"
        );


        this.loadMemory();

        this.connectNavigation();

        this.connectWindows();

        this.ready = true;

        this.showSystemReady();

    }

};









/* =====================================
   SYSTEM START
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{

    HalDo.start();

});









/* =====================================
   NAVIGATION SYSTEM
===================================== */


HalDo.connectNavigation = function(){


    const menuButton =
    document.querySelector(
        ".menu-button"
    );


    const menu =
    document.querySelector(
        "#mainMenu"
    );


    if(menuButton && menu){

        menuButton.onclick = ()=>{

            menu.classList.toggle(
                "active"
            );

        };

    }

};









/* =====================================
   WINDOW SYSTEM
===================================== */


HalDo.connectWindows = function(){


    const buttons =
    document.querySelectorAll(
        "[data-window]"
    );


    buttons.forEach(
    button=>{

        button.addEventListener(
        "click",
        ()=>{

            openWindow(
                button.dataset.window
            );

        });

    });


};









function openWindow(id){


    document
    .querySelectorAll(
        ".app-window"
    )
    .forEach(
    window=>{

        window.classList.remove(
            "active"
        );

    });


    const target =
    document.getElementById(
        id
    );


    if(target){

        target.classList.add(
            "active"
        );

    }

}









function closeWindow(){


    document
    .querySelectorAll(
        ".app-window"
    )
    .forEach(
    window=>{

        window.classList.remove(
            "active"
        );

    });

}





document
.querySelectorAll(
".close-window"
)
.forEach(
button=>{

    button.onclick =
    closeWindow;

});









/* =====================================
   MEMORY BASIS
===================================== */


HalDo.loadMemory = function(){


    const data =
    localStorage.getItem(
        "haldoMemory"
    );


    if(data){

        this.memory =
        JSON.parse(
            data
        );

    }
    else{

        this.memory = {};

    }

};









HalDo.saveMemory = function(){


    localStorage.setItem(

        "haldoMemory",

        JSON.stringify(
            this.memory
        )

    );

};









/* =====================================
   SYSTEM READY
===================================== */


HalDo.showSystemReady = function(){


    console.log(
        "✅ HalDo AI OS 10.0 bereit"
    );


};