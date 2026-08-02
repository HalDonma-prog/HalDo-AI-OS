// ===============================
// HALDO AI OS v7.0
// STARTSYSTEM
// ===============================



window.addEventListener(
"load",
function(){


const splash =
document.getElementById(
"splashScreen"
);



if(splash){


setTimeout(
function(){


splash.style.display =
"none";


const welcome =
document.getElementById(
"welcomeScreen"
);


if(welcome){

welcome.style.display =
"flex";

}


},
2500
);


}



});





// ===============================
// START BUTTON
// ===============================



function startOS(){



const welcome =
document.getElementById(
"welcomeScreen"
);



const mainOS =
document.getElementById(
"mainOS"
);



if(welcome){

welcome.style.display =
"none";

}



if(mainOS){

mainOS.style.display =
"block";

}



openPage(
"dashboard"
);



}