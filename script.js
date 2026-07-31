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

updateCount();

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


updateCount();


}






// HalDo öffnen

function openHalDoAI(){


showPage("haldoPage");


loadMessages();


}





// Nachricht senden

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


updateCount();


}







// HalDo Antwort

function haldoAntwort(text){


let frage=text.toLowerCase();


let antwort =
"Ich bin HalDo AI. Ich habe dich verstanden. 🤖";




if(frage.includes("hallo")){


antwort =
"Hallo "+aktuellerBenutzer+" 👋 Schön dich zu sehen.";


}



else if(frage.includes("wer bist du")){


antwort =
"Ich bin HalDo AI, dein Assistent in Apps Web 3.0.";


}



else if(frage.includes("hilfe")){


antwort =
"Du kannst mich fragen über Apps, Profil, Status oder Einstellungen.";


}



else if(frage.includes("status")){


antwort =
"Alle Systeme laufen 🟢 Apps Web 3.0 ist aktiv.";


}



else if(frage.includes("zeit")){


antwort =
"Die Uhrzeit ist "+new Date().toLocaleTimeString();


}



else if(frage.includes("danke")){


antwort =
"Gerne 😊 Ich helfe dir jederzeit.";


}



chatSpeicher.push({

user:"HalDo AI",

text:antwort

});



// Stimme aktivieren

sprechen(antwort);


}






// Text sprechen

function sprechen(text){


if("speechSynthesis" in window){


let sprache =
new SpeechSynthesisUtterance(text);



sprache.lang="de-DE";


window.speechSynthesis.speak(sprache);


}


}







// Mikrofon Vorbereitung

function startVoice(){


alert(
"Sprachsteuerung wird vorbereitet 🎤"
);


}








// Chat anzeigen

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






// Anzahl Nachrichten

function updateCount(){


let count =
document.getElementById("messageCount");



if(count){


count.innerText =
chatSpeicher.length;


}


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