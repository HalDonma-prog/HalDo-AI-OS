let history = [];
let historyIndex = -1;


// Start

window.onload = function(){

let user = localStorage.getItem("appsUser");


if(user){

setUser(user);

}

};




// Gastmodus

function startGuest(){

setUser("Gast");

openPage("homePage");

}




function showLogin(){

openPage("loginPage");

}






// Login

function login(){

let name =
document.getElementById("loginName").value.trim();


if(!name){

alert("Bitte Namen eingeben");

return;

}


localStorage.setItem("appsUser",name);


setUser(name);


openPage("homePage");


}







// Benutzer

function setUser(name){


let welcome =
document.getElementById("welcomeUser");


let dashboard =
document.getElementById("dashboardUser");


let text =
document.getElementById("haldoWelcome");



if(welcome){

welcome.innerText=name;

}


if(dashboard){

dashboard.innerText=name;

}


if(text){

text.innerText=
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









// HalDo Status


function setHalDoStatus(status){


let state =
document.getElementById("haldoState");


let main =
document.getElementById("mainStatus");


let voice =
document.getElementById("voiceStatus");



if(state){

state.innerText=status;

}


if(main){

main.innerText=status;

}


if(voice){

voice.innerText=status;

}


}









// HalDo AI


function sendHalDo(){


let input =
document.getElementById("haldoInput");


let text =
input.value.trim();



if(!text)return;



addHalDo(text,"user-message");


setHalDoStatus("🔵 Denkt...");



let answer =
getHalDoAnswer(text);



setTimeout(function(){


addHalDo(answer,"ai-message");


speak(answer);


},600);



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









// Befehle


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



if(cmd.includes("logo")){


return "Das HalDo AI Logo System wird vorbereitet.";

}



if(cmd.includes("avatar")){


return "Mein Avatar-System wird weiterentwickelt.";

}



if(cmd.includes("hallo") ||
cmd.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}



if(cmd.includes("version")){


return "Apps/Web 3.0 Version 2.8.0 läuft.";

}



if(cmd.includes("wer bin ich")){


return "Du bist "+
(localStorage.getItem("appsUser")||"Gast")+
".";

}



return "Ich habe dich verstanden. Meine Fähigkeiten werden erweitert.";

}









// Sprache


function startVoice(){


setHalDoStatus("🎤 Hört zu...");



if(!("webkitSpeechRecognition" in window)){


setHalDoStatus(
"Spracherkennung nicht verfügbar."
);


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



recognition.onend=function(){

setHalDoStatus("🟢 Bereit");

};



recognition.start();


}









// Stimme


function speak(text){


setHalDoStatus("🔊 Spricht...");



if("speechSynthesis" in window){


let speech =
new SpeechSynthesisUtterance(text);


speech.lang="de-DE";


speech.onend=function(){

setHalDoStatus("🟢 Bereit");

};



window.speechSynthesis.speak(speech);


}


}







// Chat


function sendMessage(){


let input =
document.getElementById("messageInput");


let text =
input.value.trim();



if(!text)return;



let box =
document.getElementById("chatBox");


let div =
document.createElement("div");


div.className="message user-message";

div.innerText=text;


box.appendChild(div);


input.value="";


}