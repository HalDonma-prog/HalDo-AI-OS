let pageHistory = [];
let currentPage = "";

let notes = [];


// START

window.onload = function(){

let savedName =
localStorage.getItem("haldoUser");


if(savedName){

updateUser(savedName);

}


};







// APP START


function startApp(){

let name =
localStorage.getItem("haldoUser");


if(!name){

name="Gast";

}


updateUser(name);

openPage("homePage");


}







// NAVIGATION


function openPage(page){


document
.querySelectorAll(".page")
.forEach(function(item){

item.classList.add("hidden");

});



let target =
document.getElementById(page);



if(target){

target.classList.remove("hidden");


pageHistory.push(page);

currentPage=page;

}


}







function goBack(){

if(pageHistory.length>1){

pageHistory.pop();

let last =
pageHistory[pageHistory.length-1];


document
.querySelectorAll(".page")
.forEach(function(item){

item.classList.add("hidden");

});


document
.getElementById(last)
.classList.remove("hidden");

}

}







// BENUTZER


function updateUser(name){


let text =
document.getElementById("welcomeText");


if(text){

text.innerText=
"Hallo "+name+" 👋";

}


}



function saveProfile(){


let input =
document.getElementById("profileName");


let name =
input.value.trim();



if(name){


localStorage.setItem(
"haldoUser",
name
);


updateUser(name);


alert("Profil gespeichert");


}


}









// HALDO STATUS


function setStatus(status){


let statusBox =
document.getElementById("statusText");


let voice =
document.getElementById("voiceStatus");



if(statusBox){

statusBox.innerText=status;

}


if(voice){

voice.innerText=status;

}


}









// HALDO AI


function sendHalDo(){


let input =
document.getElementById("haldoInput");


let text =
input.value.trim();



if(!text){

return;

}



addHalDoMessage(
text,
"user-message"
);



setStatus("🔵 Denkt...");



let answer =
haldoAnswer(text);



setTimeout(function(){


addHalDoMessage(
answer,
"ai-message"
);


speak(answer);


setStatus("🟢 Bereit");


},700);



input.value="";


}







function addHalDoMessage(text,type){


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







function haldoAnswer(text){


let command =
text.toLowerCase();



if(command.includes("notiz")){


openPage("notesPage");


return "Ich öffne deine Notizen.";

}



if(command.includes("cloud")){


openPage("cloudPage");


return "Ich öffne die Cloud.";

}



if(command.includes("dashboard")){


openPage("dashboardPage");


return "Ich öffne das Dashboard.";

}



if(command.includes("profil")){


openPage("profilePage");


return "Ich öffne dein Profil.";

}



if(command.includes("hallo") ||
command.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}



if(command.includes("version")){


return "Apps/Web 3.0 v3.0 läuft.";

}



return "Ich habe dich verstanden. Meine Funktionen werden weiter ausgebaut.";

}









// SPRACHE


function startVoice(){


setStatus("🎤 Hört zu...");



if(!("webkitSpeechRecognition" in window)){


setStatus(
"Sprache nicht verfügbar"
);


return;

}



let recognition =
new webkitSpeechRecognition();



recognition.lang="de-DE";



recognition.onresult=function(event){


let text =
event.results[0][0].transcript;



document
.getElementById("haldoInput")
.value=text;


sendHalDo();


};



recognition.onend=function(){

setStatus("🟢 Bereit");

};



recognition.start();


}









// SPRACHAUSGABE


function speak(text){


if(
"speechSynthesis"
in window
){


let speech =
new SpeechSynthesisUtterance(text);


speech.lang="de-DE";


window
.speechSynthesis
.speak(speech);


}


}









// CHAT


function sendMessage(){


let input =
document.getElementById("messageInput");


let text =
input.value.trim();



if(!text)return;



let box =
document.getElementById("chatBox");


let message =
document.createElement("div");



message.className=
"message user-message";


message.innerText=text;


box.appendChild(message);


input.value="";


}









// NOTIZEN


function createNote(){


let note =
prompt(
"Neue Notiz:"
);



if(note){


notes.push(note);


renderNotes();


}

}





function renderNotes(){


let list =
document.getElementById("notesList");


if(!list)return;


list.innerHTML="";


notes.forEach(function(item){


let div =
document.createElement("div");


div.className="note-item";


div.innerText=item;


list.appendChild(div);


});


}