let aktuellerBenutzer = "";

let chatSpeicher = [];




// Daten laden

function loadData(){


aktuellerBenutzer =
localStorage.getItem("aktuellerBenutzer") || "";



let chat =
localStorage.getItem("haldoChat");



if(chat){

chatSpeicher = JSON.parse(chat);

}




if(aktuellerBenutzer){

showPage("dashboard");

updateUser();

}



}





// Seiten wechseln

function showPage(page){


document.getElementById("loginPage").style.display="none";

document.getElementById("dashboard").style.display="none";

document.getElementById("haldoPage").style.display="none";

document.getElementById("profilePage").style.display="none";



document.getElementById(page).style.display="block";


}




// Login

function login(){


let name =
document.getElementById("loginName").value.trim();



let password =
document.getElementById("loginPassword").value.trim();



if(name==="" || password===""){


alert("Bitte Daten eingeben");


return;

}



aktuellerBenutzer=name;



localStorage.setItem(

"aktuellerBenutzer",

name

);



showPage("dashboard");


updateUser();


}





function updateUser(){


document.getElementById("activeUser")
.innerText=aktuellerBenutzer;


}





// Dashboard

function goDashboard(){


showPage("dashboard");


}




// HalDo AI

function openHalDoAI(){


showPage("haldoPage");


loadMessages();


}





function sendMessage(){


let input =
document.getElementById("messageInput");



let text =
input.value.trim();



if(text===""){

return;

}



chatSpeicher.push({

user:aktuellerBenutzer,

text:text

});



haldoAntwort(text);



saveChat();



input.value="";



loadMessages();


}





// HalDo KI Antwort

function haldoAntwort(text){


let frage=text.toLowerCase();


let antwort =
"Ich bin HalDo AI und habe deine Nachricht verstanden. 🤖";




if(frage.includes("hallo")){


antwort =
"Hallo "+aktuellerBenutzer+" 👋 Ich bin HalDo AI.";

}



else if(frage.includes("hilfe")){


antwort =
"Ich kann dir helfen mit: Apps, Profil, Status und Fragen.";


}



else if(frage.includes("status")){


antwort =
"Apps Web 3.0 ist aktiv 🟢";


}



else if(frage.includes("profil")){


antwort =
"Du kannst dein Profil im Profil-Bereich ändern.";


}



else if(frage.includes("app")){


antwort =
"Deine verfügbaren Bereiche sind: HalDo AI, Profil und Cloud.";


}



chatSpeicher.push({

user:"HalDo AI",

text:antwort

});


}





function loadMessages(){


let box =
document.getElementById("chatBox");



box.innerHTML="";



chatSpeicher.forEach(function(item){


let div =
document.createElement("div");



if(item.user==="HalDo AI"){


div.className="message bot";


}

else{


div.className="message user";


}



div.innerText =
item.user+": "+item.text;



box.appendChild(div);



});


}





function saveChat(){


localStorage.setItem(

"haldoChat",

JSON.stringify(chatSpeicher)

);


}





// Profil

function openProfile(){


showPage("profilePage");


}



function changeName(){


let name =
document.getElementById("profileName")
.value.trim();



if(name){


aktuellerBenutzer=name;


localStorage.setItem(

"aktuellerBenutzer",

name

);


}



goDashboard();


}




window.onload=function(){


loadData();



let input =
document.getElementById("messageInput");



if(input){


input.addEventListener(

"keydown",

function(e){


if(e.key==="Enter"){


e.preventDefault();


sendMessage();


}


});


}



if("serviceWorker" in navigator){


navigator.serviceWorker.register(
"service-worker.js"
);


}



};