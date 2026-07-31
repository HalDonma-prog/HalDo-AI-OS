let currentPage = "loginPage";

let history = [];

let historyIndex = -1;


// Start

window.onload = function(){


let user = localStorage.getItem("appsUser");


if(user){


showHome();


document.getElementById("welcomeUser").innerText = user;


document.getElementById("dashboardUser").innerText = user;


let welcome = document.getElementById("haldoWelcome");


if(welcome){

welcome.innerText =
"Hallo "+user+" 👋 HalDo AI ist bereit.";

}


}



loadMessages();


};








// LOGIN

function login(){


let name =
document.getElementById("loginName").value.trim();



if(name===""){

alert("Bitte Namen eingeben");

return;

}



localStorage.setItem("appsUser",name);



document.getElementById("welcomeUser").innerText=name;


document.getElementById("dashboardUser").innerText=name;



let welcome=document.getElementById("haldoWelcome");


if(welcome){

welcome.innerText =
"Hallo "+name+" 👋 HalDo AI ist bereit.";

}



showHome();


}








// Seiten wechseln

function openPage(page){


let pages=document.querySelectorAll(".page");


pages.forEach(function(p){

p.classList.add("hidden");

});



let target=document.getElementById(page);



if(target){


target.classList.remove("hidden");


currentPage=page;


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








// zurück

function goBack(){


if(historyIndex>0){


historyIndex--;


openPage(history[historyIndex]);


}


}








// weiter

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



document.getElementById("welcomeUser").innerText=name;


document.getElementById("dashboardUser").innerText=name;


alert("Profil gespeichert");


}


}








// Chat

function sendMessage(){


let input=document.getElementById("messageInput");


let text=input.value.trim();



if(text===""){

return;

}



addMessage(text,"user-message");



let messages =
JSON.parse(localStorage.getItem("chatMessages") || "[]");



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



setTimeout(function(){


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


let messages =
JSON.parse(localStorage.getItem("chatMessages") || "[]");



messages.forEach(function(m){


addMessage(
m.text,
m.type
);


});



updateCount();


}








function updateCount(){


let messages =
JSON.parse(localStorage.getItem("chatMessages") || "[]");



let count=document.getElementById("messageCount");



if(count){

count.innerText=messages.length;

}


}









// HALDO AI


function sendHalDo(){


let input=document.getElementById("haldoInput");


let text=input.value.trim();



if(text===""){

return;

}



addHalDo(text,"user-message");



let answer=getHalDoAnswer(text);



setTimeout(function(){


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









// HalDo Antworten

function getHalDoAnswer(text){


let command=text.toLowerCase();




if(command.includes("profil")){


openPage("profilePage");


return "Ich öffne dein Profil.";

}





if(command.includes("dashboard")){


openPage("dashboardPage");


return "Ich öffne dein Dashboard.";

}





if(command.includes("chat")){


openPage("chatPage");


return "Ich öffne den Chat.";

}





if(command.includes("cloud")){


openPage("cloudPage");


return "Ich öffne die Cloud-Vorbereitung.";

}





if(command.includes("einstellung")){


openPage("settingsPage");


return "Ich öffne die Einstellungen.";

}





if(command.includes("nach hause")
|| command.includes("home")){


openPage("homePage");


return "Ich gehe zum Hauptmenü.";

}





if(command.includes("wer bin ich")){


let user =
localStorage.getItem("appsUser")
|| "unbekannt";



return "Du bist "+user+".";

}





if(command.includes("version")){


return "Apps/Web 3.0 Version 2.5.0 läuft.";

}





if(command.includes("hilfe")
|| command.includes("was kannst du")){


return "Ich kann Bereiche öffnen und dich durch Apps/Web 3.0 führen.";

}





if(command.includes("hallo")
|| command.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}





return "Ich habe dich verstanden. Meine Funktionen werden weiter erweitert.";

}








// Sprache vorbereiten

function startVoice(){


let status=document.getElementById("voiceStatus");



if(status){

status.innerText=
"🎤 Sprachfunktion vorbereitet.";

}



}





// Sprachausgabe

function speak(text){


if("speechSynthesis" in window){


let speech =
new SpeechSynthesisUtterance(text);


speech.lang="de-DE";


window.speechSynthesis.speak(speech);


}


}