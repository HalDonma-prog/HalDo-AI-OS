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

}

};






// Login

function login(){

let name = document.getElementById("loginName").value.trim();


if(name === ""){

alert("Bitte Namen eingeben");

return;

}


localStorage.setItem("appsUser",name);


document.getElementById("welcomeUser").innerText=name;

document.getElementById("dashboardUser").innerText=name;


showHome();


}








// Seiten öffnen

function openPage(page){


let pages=document.querySelectorAll(".page");


pages.forEach(p=>{

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

showHome();

}







// Zurück

function goBack(){


if(historyIndex>0){

historyIndex--;

openPage(history[historyIndex]);

}


}







// Weiter

function goForward(){


if(historyIndex<history.length-1){

historyIndex++;

openPage(history[historyIndex]);

}


}








// Profil

function saveProfile(){

let name=document.getElementById("newName").value.trim();


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



addChatMessage(text,"user-message");


let messages=JSON.parse(localStorage.getItem("chatMessages") || "[]");


messages.push({

text:text,

type:"user-message"

});


localStorage.setItem("chatMessages",JSON.stringify(messages));



input.value="";


setTimeout(()=>{

addChatMessage("Nachricht gespeichert 👍","ai-message");


},500);


updateCount();


}








function addChatMessage(text,type){


let box=document.getElementById("chatBox");


if(!box)return;


let div=document.createElement("div");


div.className="message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop=box.scrollHeight;


}








function updateCount(){


let messages=JSON.parse(localStorage.getItem("chatMessages") || "[]");


let count=document.getElementById("messageCount");


if(count){

count.innerText=messages.length;

}


}









// HalDo AI

function sendHalDo(){


let input=document.getElementById("haldoInput");


let text=input.value.trim();


if(text===""){

return;

}



addHalDo(text,"user-message");



let answer=getHalDoAnswer(text);


setTimeout(()=>{

addHalDo(answer,"ai-message");

},500);



input.value="";


}








function addHalDo(text,type){


let box=document.getElementById("haldoChat");


let div=document.createElement("div");


div.className="message "+type;


div.innerText=text;


box.appendChild(div);


box.scrollTop=box.scrollHeight;


}









function getHalDoAnswer(text){


text=text.toLowerCase();



// Befehle


if(text.includes("profil")){

openPage("profilePage");

return "Ich öffne dein Profil.";

}



if(text.includes("dashboard")){

openPage("dashboardPage");

return "Ich öffne dein Dashboard.";

}



if(text.includes("einstellung")){

openPage("settingsPage");

return "Ich öffne die Einstellungen.";

}



if(text.includes("chat")){

openPage("chatPage");

return "Ich öffne den Chat.";

}



if(text.includes("hallo") || text.includes("hi")){

return "Hallo 👋 Ich bin HalDo AI und bereit zu helfen.";

}



if(text.includes("wie viele") && text.includes("nachrichten")){


let messages=JSON.parse(localStorage.getItem("chatMessages") || "[]");


return "Du hast "+messages.length+" Nachrichten gespeichert.";

}




return "Ich habe dich verstanden. Weitere Funktionen kommen mit den nächsten Versionen.";

}








// alte Nachrichten laden

window.addEventListener("load",()=>{


let messages=JSON.parse(localStorage.getItem("chatMessages") || "[]");


messages.forEach(m=>{

addChatMessage(m.text,m.type);

});


updateCount();


});