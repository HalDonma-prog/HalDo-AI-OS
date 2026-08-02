/* =====================================
   HALDO AI OS v9.0
   MAIN SYSTEM ENGINE
   PART 1/8
   ===================================== */



// =====================================
// SYSTEM START
// =====================================


window.onload = function(){


console.log(
"🌍 HalDo AI OS v9.0 gestartet"
);



setTimeout(()=>{


document.getElementById(
"bootScreen"
).style.display="none";


document.getElementById(
"welcomeScreen"
).style.display="flex";


},3500);



updateClock();


setInterval(
updateClock,
1000
);


};







// =====================================
// START OS
// =====================================


function startOS(){


document.getElementById(
"welcomeScreen"
).style.display="none";


document.getElementById(
"desktop"
).style.display="block";



openApp(
"dashboard"
);



showNotification(
"🚀 HalDo AI OS gestartet"
);



}








// =====================================
// CLOCK
// =====================================


function updateClock(){


let now =
new Date();



let time =
now.toLocaleTimeString(
"de-DE"
);



let clock =
document.getElementById(
"clock"
);



let systemTime =
document.getElementById(
"systemTime"
);



if(clock){

clock.innerHTML=time;

}



if(systemTime){

systemTime.innerHTML=time;

}



}








// =====================================
// APP NAVIGATION
// =====================================


function openApp(appName){


let windows =
document.querySelectorAll(
".window"
);



windows.forEach(
window=>{

window.classList.remove(
"active"
);

});



let app =
document.getElementById(
appName
);



if(app){

app.classList.add(
"active"
);

}


}
