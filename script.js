/* =====================================
   HALDO AI OS BROWSER v1.1
   CLEAN FINAL SCRIPT
   PART 1/4
===================================== */


/* =====================================
   HALDO SYSTEM START
===================================== */


document.addEventListener(
"DOMContentLoaded",
() => {


console.log(
"💙 HalDo AI OS gestartet"
);



/*
   HalDo Identity Core

   H + AI + Stern Logo System
*/

const HalDoCore = {

    name: "HalDo AI OS",

    version: "v1.1",

    symbol: "H★AI",

    status: "online"


};



window.HalDoCore = HalDoCore;









/* =====================================
   BOOT EXPERIENCE
===================================== */


const boot = document.getElementById(
"haldoBoot"
);



if(boot){

setTimeout(()=>{


boot.style.display="none";


},3000);


}









/* =====================================
   NAVIGATION SYSTEM
===================================== */


const buttons = document.querySelectorAll(
".nav-button"
);



const pages = document.querySelectorAll(
".page"
);



buttons.forEach(button => {



button.addEventListener(
"click",
()=>{


const target =
button.dataset.page;



if(!target) return;





pages.forEach(page=>{


page.classList.remove(
"active"
);


});





const selected =
document.getElementById(
target
);



if(selected){


selected.classList.add(
"active"
);


}





buttons.forEach(btn=>{


btn.classList.remove(
"active"
);


});





button.classList.add(
"active"
);





console.log(
"HalDo Navigation:",
target
);



}

);



});









/* =====================================
   START MESSAGE
===================================== */


setTimeout(()=>{


const startMessage = {


de:
"💙 HalDo AI OS gestartet. Willkommen zurück.",


tr:
"💙 HalDo AI OS başladı. Hoş geldiniz.",


ku:
"💙 HalDo AI OS dest pê kir. Bi xêr hatî.",


en:
"💙 HalDo AI OS started. Welcome back."


};



window.HalDoWelcome =
startMessage;



},
500);





});
