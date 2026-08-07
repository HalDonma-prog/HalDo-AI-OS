/*
====================================

HalDo AI OS 18
Startup System

Professional Ultimate Foundation

====================================
*/


console.log(
"🚀 HalDo AI OS startup.js geladen"
);




function setSystemMessage(message){


const status =
document.getElementById(
"system-status"
);



if(status){

status.innerHTML = message;

}


}





function showWelcome(){


const startup =
document.getElementById(
"startup-screen"
);



const welcome =
document.getElementById(
"welcome-screen"
);





if(startup){

startup.style.display =
"none";

}





if(welcome){

welcome.classList.remove(
"hidden"
);


welcome.style.display =
"flex";

}



}








function startHalDoOS(){



setSystemMessage(
"🟡 HalDo AI OS startet..."
);





setTimeout(function(){


setSystemMessage(
"🔵 Kernel wird geladen..."
);


},2000);







setTimeout(function(){


setSystemMessage(
"🔵 Module werden geprüft..."
);


},4000);







setTimeout(function(){


setSystemMessage(
"🟢 System bereit"
);


},6000);







setTimeout(function(){


showWelcome();


},7500);



}







window.addEventListener(
"load",
startHalDoOS
);