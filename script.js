let aktuellerBenutzer = "";

let chatSpeicher = [];




// Daten laden

function loadData(){


aktuellerBenutzer =
localStorage.getItem("aktuellerBenutzer") || "";



let chat =
localStorage.getItem("appsChat");


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

document.getElementById("chatPage").style.display="none";

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





// Benutzer anzeigen

function updateUser(){


document.getElementById("activeUser")
.innerText=aktuellerBenutzer;



}




// Dashboard

function goDashboard(){


showPage("dashboard");


}



// Chat

function openChat(){


showPage("chatPage");


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



kiAntwort(text);



saveChat();



input.value="";



loadMessages();



}





// KI Antworten

function kiAntwort(text){


let frage=text.toLowerCase();


let antwort=
"Ich habe deine Nachricht verstanden. 🙂";




if(frage.includes("hallo")){


antwort="Hallo "+aktuellerBenutzer+" 👋 Wie kann ich helfen?";


}



else if(frage.includes("hilfe")){


antwort=
"Befehle: Hallo, Status, Name, Apps, Zeit";


}



else if(frage.includes("status")){


antwort=
"Apps Web 3.0 läuft erfolgreich 🟢";


}



else if(frage.includes("name")){


antwort=
"Du bist angemeldet als "+aktuellerBenutzer;


}



else if(frage.includes("apps")){


antwort=
"Verfügbare Bereiche: Chat, Profil, Dashboard";


}



else if(frage.includes("zeit")){


antwort=
"Die aktuelle Zeit ist: "+
new Date().toLocaleTimeString();


}




chatSpeicher.push({

user:"Apps Web KI",

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



if(item.user==="Apps Web KI"){


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

"appsChat",

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