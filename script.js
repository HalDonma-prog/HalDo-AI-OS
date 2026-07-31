let history = [];
let notes = [];


// START

window.onload = function(){

let user =
localStorage.getItem("haldoUser");


if(user){

updateUser(user);

}

};







// APP START


function startApp(){


let user =
localStorage.getItem("haldoUser")
|| "Gast";



updateUser(user);


openPage("homePage");


}









// NAVIGATION


function openPage(page){


document
.querySelectorAll(".page")
.forEach(function(p){

p.classList.add("hidden");

});



let target =
document.getElementById(page);



if(target){

target.classList.remove("hidden");


history.push(page);

}

}



function goBack(){


if(history.length>1){

history.pop();


let last =
history[history.length-1];


document
.querySelectorAll(".page")
.forEach(function(p){

p.classList.add("hidden");

});


document
.getElementById(last)
.classList.remove("hidden");


}


}









// PROFIL


function updateUser(name){


let box =
document.getElementById("welcomeText");


if(box){

box.innerText =
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









// STATUS


function setStatus(status){


let a =
document.getElementById("statusText");


let b =
document.getElementById("voiceStatus");


let c =
document.getElementById("startStatus");



if(a)a.innerText=status;

if(b)b.innerText=status;

if(c)c.innerText=status;


}









// HALDO AI


function sendHalDo(){


let input =
document.getElementById("haldoInput");


let text =
input.value.trim();



if(!text)return;



addHalDo(text,"user-message");


setStatus("🔵 HalDo denkt...");



let answer =
haldoResponse(text);



setTimeout(function(){


addHalDo(answer,"ai-message");


speak(answer);


setStatus("🟢 HalDo bereit");


},700);



input.value="";


}









function addHalDo(text,type){


let box =
document.getElementById("haldoChat");


if(!box)return;



let div =
document.createElement("div");


div.className=
"message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop=
box.scrollHeight;


}









function haldoResponse(text){


let command =
text.toLowerCase();



if(command.includes("notiz")){


openPage("notesPage");


return "Ich öffne deine Notizen.";

}



if(command.includes("erstelle")){


return "Ich kann eine neue Aufgabe oder Notiz vorbereiten.";

}



if(command.includes("dashboard")){


openPage("dashboardPage");


return "Dashboard geöffnet.";

}



if(command.includes("profil")){


openPage("profilePage");


return "Profil geöffnet.";

}



if(command.includes("module")){


return "Meine Module sind AI, Chat, Notizen, Cloud, Dashboard und Einstellungen.";

}



if(command.includes("hilfe")){


return "Ich helfe dir bei Navigation und Organisation.";

}



if(command.includes("hallo") ||
command.includes("hi")){


return "Hallo 👋 Ich bin HalDo AI.";

}



if(command.includes("version")){


return "Apps/Web 3.1 mit HalDo AI läuft.";

}



return "Ich habe deine Anfrage verstanden. Meine Fähigkeiten werden weiter ausgebaut.";

}









// SPRACHE


function startVoice(){


setStatus("🎤 HalDo hört zu...");



if(!("webkitSpeechRecognition" in window)){


setStatus("Sprache nicht verfügbar");


return;

}



let recognition =
new webkitSpeechRecognition();


recognition.lang="de-DE";



recognition.onresult=function(event){


let result =
event.results[0][0].transcript;



document
.getElementById("haldoInput")
.value=result;


sendHalDo();


};



recognition.onend=function(){

setStatus("🟢 HalDo bereit");

};



recognition.start();


}









// SPRACHE AUSGABE


function speak(text){


if("speechSynthesis" in window){


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


let div =
document.createElement("div");



div.className=
"message user-message";


div.innerText=text;


box.appendChild(div);


input.value="";


}









// NOTIZEN


function createNote(){


let note =
prompt(
"Neue Notiz eingeben:"
);



if(note){


notes.push(note);


showNotes();


}


}







function showNotes(){


let list =
document.getElementById("notesList");


if(!list)return;



list.innerHTML="";



notes.forEach(function(note){


let item =
document.createElement("div");


item.className="note-item";


item.innerText=note;


list.appendChild(item);


});


}