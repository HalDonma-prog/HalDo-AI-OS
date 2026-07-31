let aktuellerBenutzer = "";

let chatSpeicher = [];

let verlauf = [];

let verlaufPosition = -1;




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





// Seiten wechseln mit Verlauf

function showPage(page){


let aktuelleSeite = page;



if(verlauf[verlaufPosition] !== page){


verlauf =
verlauf.slice(0, verlaufPosition + 1);



verlauf.push(page);


verlaufPosition = verlauf.length - 1;


}





document.getElementById("loginPage").style.display="none";

document.getElementById("dashboard").style.display="none";

document.getElementById("haldoPage").style.display="none";

document.getElementById("profilePage").style.display="none";



document.getElementById(page).style.display="block";



}






// Zurück

function goBack(){


if(verlaufPosition > 0){


verlaufPosition--;


zeigeVerlauf();

}


}





// Vorwärts

function goForward(){


if(verlaufPosition < verlauf.length-1){


verlaufPosition++;


zeigeVerlauf();


}


}





function zeigeVerlauf(){


let page =
verlauf[verlaufPosition];



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






function goDashboard(){


showPage("dashboard");


updateCount();


}







// HalDo


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


updateCount();


}






function haldoAntwort(text){


let frage =
text.toLowerCase();



let antwort =
"Ich bin HalDo AI. Ich helfe dir gerne. 🤖";



if(frage.includes("hallo")){


antwort =
"Hallo "+aktuellerBenutzer+" 👋";


}


else if(frage.includes("hilfe")){


antwort =
"Ich kann Fragen beantworten und dich durch Apps Web 3.0 führen.";


}


else if(frage.includes("status")){


antwort =
"System Status: Alles läuft 🟢";


}



else if(frage.includes("zurück")){


antwort =
"Nutze den Zurück-Button ⬅️ oben.";


}



chatSpeicher.push({

user:"HalDo AI",

text:antwort

});



sprechen(antwort);


}






function sprechen(text){


if("speechSynthesis" in window){


let stimme =
new SpeechSynthesisUtterance(text);


stimme.lang="de-DE";


window.speechSynthesis.speak(stimme);


}


}







function startVoice(){


alert("Sprachsteuerung wird weiter entwickelt 🎤");


}








function loadMessages(){


let box =
document.getElementById("chatBox");


box.innerHTML="";



chatSpeicher.forEach(function(item){


let div =
document.createElement("div");



div.className =
item.user==="HalDo AI"
?"message bot"
:"message user";



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





function updateCount(){


let count =
document.getElementById("messageCount");



if(count){


count.innerText=chatSpeicher.length;


}


}





// Profil


function openProfile(){


showPage("profilePage");


}




function changeName(){


let name =
document.getElementById("profileName").value.trim();



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



if("serviceWorker" in navigator){


navigator.serviceWorker.register(
"service-worker.js"
);


}



};