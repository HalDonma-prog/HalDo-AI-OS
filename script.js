let history = [];

let historyIndex = -1;



// Start

window.onload = function(){


let user = localStorage.getItem("appsUser");


if(user){


showHome();


setUser(user);


}


loadMessages();


};






function setUser(user){


let a=document.getElementById("welcomeUser");

let b=document.getElementById("dashboardUser");

let c=document.getElementById("haldoWelcome");



if(a) a.innerText=user;

if(b) b.innerText=user;

if(c) c.innerText=
"Hallo "+user+" 👋 HalDo AI ist bereit.";

}







// Login


function login(){


let name=
document.getElementById("loginName").value.trim();



if(!name){

alert("Bitte Benutzername eingeben");

return;

}



localStorage.setItem("appsUser",name);


setUser(name);


showHome();


}








// Navigation


function openPage(page){


document.querySelectorAll(".page")
.forEach(function(p){

p.classList.add("hidden");

});



let target=document.getElementById(page);



if(target){

target.classList.remove("hidden");


history.push(page);

historyIndex=history.length-1;

}


}







function showHome(){

openPage("homePage");

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


let name=
document.getElementById("newName").value.trim();



if(name){


localStorage.setItem("appsUser",name);


setUser(name);


alert("Profil gespeichert");


}


}









// Chat


function sendMessage(){


let input=
document.getElementById("messageInput");


let text=input.value.trim();



if(!text)return;



addMessage(text,"user-message");



let messages=
JSON.parse(
localStorage.getItem("chatMessages")||"[]"
);



messages.push({

text:text,

type:"user-message"

});



localStorage.setItem(
"chatMessages",
JSON.stringify(messages)
);



input.value="";


updateCount();


setTimeout(()=>{

addMessage(
"Nachricht gespeichert 👍",
"ai-message"
);

},400);


}






function addMessage(text,type){


let box=document.getElementById("chatBox");


if(!box)return;



let div=document.createElement("div");


div.className="message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop=box.scrollHeight;


}







function loadMessages(){


let messages=
JSON.parse(
localStorage.getItem("chatMessages")||"[]"
);



messages.forEach(m=>{

addMessage(
m.text,
m.type
);

});



updateCount();


}







function updateCount(){


let box=document.getElementById("messageCount");


let messages=
JSON.parse(
localStorage.getItem("chatMessages")||"[]"
);



if(box){

box.innerText=messages.length;

}


}









// HALDO AI


function sendHalDo(){


let input=
document.getElementById("haldoInput");


let text=input.value.trim();



if(!text)return;



addHalDo(text,"user-message");



let answer=getHalDoAnswer(text);



setTimeout(()=>{


addHalDo(answer,"ai-message");


speak(answer);


},500);



input.value="";


}







function addHalDo(text,type){


let box=document.getElementById("haldoChat");


if(!box)return;



let div=document.createElement("div");


div.className="message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop=box.scrollHeight;


}








// Befehle


function getHalDoAnswer(text){


let cmd=text.toLowerCase();





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

return "Ich öffne Einstellungen.";

}





if(cmd.includes("home") ||
cmd.includes("hauptmenü") ||
cmd.includes("nach hause")){


openPage("homePage");

return "Ich gehe zum Hauptmenü.";

}





if(cmd.includes("wer bin ich")){


return "Du bist "+
(localStorage.getItem("appsUser")||"unbekannt")+
".";

}





if(cmd.includes("version")){


return "Apps/Web 3.0 Version 2.6.0 läuft.";

}





if(cmd.includes("hallo") ||
cmd.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}





if(cmd.includes("hilfe")){


return "Ich kann Seiten öffnen und dir bei Apps/Web 3.0 helfen.";

}





return "Ich habe deine Anfrage verstanden und lerne weiter.";

}









// 🎤 Sprachsteuerung


function startVoice(){


let status=
document.getElementById("voiceStatus");



if(!('webkitSpeechRecognition' in window)){


if(status){

status.innerText=
"Spracherkennung wird von diesem Browser nicht unterstützt.";

}


return;

}





let recognition=
new webkitSpeechRecognition();



recognition.lang="de-DE";


recognition.continuous=false;


recognition.interimResults=false;



recognition.onstart=function(){


if(status){

status.innerText=
"🎤 Ich höre zu...";

}


};





recognition.onresult=function(event){


let text=
event.results[0][0].transcript;



if(status){

status.innerText=
"Erkannt: "+text;

}



document.getElementById("haldoInput").value=text;


sendHalDo();


};





recognition.onerror=function(){


if(status){

status.innerText=
"Fehler bei Spracheingabe.";

}


};



recognition.start();


}








// 🔊 Stimme


function speak(text){


if("speechSynthesis" in window){


let speech=
new SpeechSynthesisUtterance(text);


speech.lang="de-DE";


speech.rate=1;


window.speechSynthesis.speak(speech);


}


}