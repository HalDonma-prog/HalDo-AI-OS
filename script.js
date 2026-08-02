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
// ===============================
// SEITEN WECHSEL
// ===============================



function openPage(pageId){



const pages =
document.querySelectorAll(
".page"
);



pages.forEach(
function(page){

page.classList.remove(
"active"
);

});



const selected =
document.getElementById(
pageId
);



if(selected){

selected.classList.add(
"active"
);

}



}






// ===============================
// HALDO AI CHAT
// ===============================



function sendAI(){



const input =
document.getElementById(
"aiInput"
);



const history =
document.getElementById(
"chatHistory"
);



if(
input &&
history &&
input.value.trim() !== ""
){


const message =
document.createElement(
"p"
);


message.innerHTML =
"👤 " +
input.value;



history.appendChild(
message
);



const answer =
document.createElement(
"p"
);


answer.innerHTML =
"🤖 HalDo AI ist bereit.";



history.appendChild(
answer
);



input.value =
"";


}


}