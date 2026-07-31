let history = [];
let historyIndex = -1;


// Start

window.onload = function(){

let user = localStorage.getItem("appsUser");


if(user){

setUser(user);

}


};




// Gast starten

function startGuest(){

setUser("Gast");

openPage("homePage");

}


// Login anzeigen

function showLogin(){

openPage("loginPage");

}





// Login

function login(){

let name =
document.getElementById("loginName").value.trim();


if(name===""){

alert("Bitte Namen eingeben");

return;

}


localStorage.setItem("appsUser",name);


setUser(name);


openPage("homePage");


}







// Benutzer setzen

function setUser(name){


let a=document.getElementById("welcomeUser");

let b=document.getElementById("dashboardUser");

let c=document.getElementById("haldoWelcome");



if(a){

a.innerText=name;

}


if(b){

b.innerText=name;

}


if(c){

c.innerText=
"Hallo "+name+" 👋 HalDo AI ist bereit.";

}


}








// Navigation


function openPage(page){


document.querySelectorAll(".page")
.forEach(function(p){

p.classList.add("hidden");

});



let target =
document.getElementById(page);



if(target){

target.classList.remove("hidden");


history.push(page);

historyIndex =
history.length-1;

}


}







function goHome(){

openPage("homePage");

}







function goBack(){


if(historyIndex>0){

historyIndex--;

openPage(history[historyIndex]);

}


}






function goForward(){


if(historyIndex<history.length-1){

historyIndex++;

openPage(history[historyIndex]);

}


}









// Profil


function saveProfile(){


let name =
document.getElementById("newName").value.trim();



if(name){


localStorage.setItem("appsUser",name);


setUser(name);


alert("Profil gespeichert");


}


}









// Chat


function sendMessage(){


let input =
document.getElementById("messageInput");


let text =
input.value.trim();



if(!text)return;



addMessage(text,"user-message");


input.value="";


setTimeout(function(){


addMessage(
"HalDo hat deine Nachricht gespeichert 👍",
"ai-message"
);


},400);


}








function addMessage(text,type){


let box =
document.getElementById("chatBox");


if(!box)return;



let div =
document.createElement("div");


div.className =
"message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop =
box.scrollHeight;


}









// HALDO AI


function sendHalDo(){


let input =
document.getElementById("haldoInput");


let text =
input.value.trim();



if(!text)return;



addHalDo(text,"user-message");


let answer =
getHalDoAnswer(text);



setTimeout(function(){


addHalDo(answer,"ai-message");


speak(answer);


},500);



input.value="";


}








function addHalDo(text,type){


let box =
document.getElementById("haldoChat");


if(!box)return;



let div =
document.createElement("div");


div.className =
"message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop =
box.scrollHeight;


}









// HalDo Befehle


function getHalDoAnswer(text){


let cmd =
text.toLowerCase();




if(cmd.includes("profil")){

openPage("profilePage");

return "Ich öffne dein Profil.";

}



if(cmd.includes("dashboard")){

openPage("dashboardPage");

return "Ich öffne dein Dashboard.";

}



if(cmd.includes("chat")){

openPage("chatPage");

return "Ich öffne den Chat.";

}



if(cmd.includes("cloud")){

openPage("cloudPage");

return "Ich öffne die Cloud.";

}



if(cmd.includes("einstellung")){

openPage("settingsPage");

return "Ich öffne die Einstellungen.";

}



if(cmd.includes("hallo") ||
cmd.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}



if(cmd.includes("wer bin ich")){


return "Du bist "+
(localStorage.getItem("appsUser")||"Gast")+
".";

}



if(cmd.includes("version")){


return "Apps/Web 3.0 Version 2.7.0 läuft.";

}



if(cmd.includes("hilfe")){


return "Ich kann dir helfen und Bereiche der App öffnen.";

}



return "Ich habe dich verstanden. Meine Funktionen werden erweitert.";

}









// Sprache vorbereiten


function startVoice(){


let status =
document.getElementById("voiceStatus");



if(status){

status.innerText =
"🎤 Sprachfunktion wird gestartet...";

}




if(!("webkitSpeechRecognition" in window)){


if(status){

status.innerText =
"Spracherkennung nicht verfügbar.";

}


return;

}





let recognition =
new webkitSpeechRecognition();



recognition.lang="de-DE";


recognition.onresult=function(event){


let text =
event.results[0][0].transcript;



document.getElementById("haldoInput").value=text;


sendHalDo();


};



recognition.start();


}








// Stimme


function speak(text){


if("speechSynthesis" in window){


let speech =
new SpeechSynthesisUtterance(text);


speech.lang="de-DE";


window.speechSynthesis.speak(speech);


}

}