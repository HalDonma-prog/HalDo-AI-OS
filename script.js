// ==================================
// HALDO AI OS v8.1
// COMPLETE SCRIPT FIX
// ==================================



// START SYSTEM

window.onload = function(){


const splash =
document.getElementById("splashScreen");


const welcome =
document.getElementById("welcomeScreen");


const main =
document.getElementById("mainOS");



if(main){

main.style.display = "none";

}



setTimeout(function(){


if(splash){

splash.style.display = "none";

}



if(welcome){

welcome.style.display = "flex";

}



},2500);



loadChat();


};






// START BUTTON

function startOS(){


const welcome =
document.getElementById("welcomeScreen");


const main =
document.getElementById("mainOS");



if(welcome){

welcome.style.display="none";

}



if(main){

main.style.display="block";

}



openPage("dashboard");


}







// NAVIGATION

function openPage(id){


const pages =
document.querySelectorAll(".page");



pages.forEach(function(page){

page.classList.remove("active");

});



const target =
document.getElementById(id);



if(target){

target.classList.add("active");

}


}







// AI CHAT

function sendAI(){


const input =
document.getElementById("aiInput");



if(!input){

return;

}



let text =
input.value.trim();



if(text===""){

return;

}



addChatMessage(
"👤 " + text,
"user"
);



setTimeout(function(){


let answer =
getAnswer(text);



addChatMessage(
"🤖 " + answer,
"ai"
);



saveChat();


},500);



input.value="";


}





function getAnswer(text){


text =
text.toLowerCase();



if(text.includes("hallo")){

return "Hallo 👋 Ich bin HalDo AI.";

}



if(text.includes("wer bist du")){

return "Ich bin HalDo AI Engine.";

}



if(text.includes("hilfe")){

return "Ich helfe dir mit deinen Aufgaben und Modulen.";

}



return "Ich habe deine Nachricht erhalten.";


}







function addChatMessage(text,type){


const history =
document.getElementById("chatHistory");



if(!history){

return;

}



const message =
document.createElement("div");



message.className =
"chat-message " + type + "-message";



message.innerHTML =
text +
"<br><small>"
+
new Date().toLocaleTimeString()
+
"</small>";



history.appendChild(message);


}







function saveChat(){


const history =
document.getElementById("chatHistory");



if(history){

localStorage.setItem(
"haldoChat",
history.innerHTML
);


}


}







function loadChat(){


const history =
document.getElementById("chatHistory");



const saved =
localStorage.getItem("haldoChat");



if(history && saved){

history.innerHTML =
saved;

}


}







function clearChat(){


const history =
document.getElementById("chatHistory");



if(history){

history.innerHTML="";

}



localStorage.removeItem("haldoChat");


}







function speakAI(){


const history =
document.getElementById("chatHistory");



if(
history &&
window.speechSynthesis
){


let speech =
new SpeechSynthesisUtterance(
history.innerText
);



speech.lang="de-DE";


speechSynthesis.speak(
speech
);


}


}







function createPDF(){

alert(
"📄 PDF Funktion wird erweitert"
);


}







function saveNote(){

const input =
document.getElementById("noteInput");


const list =
document.getElementById("noteList");



if(input && list && input.value.trim()!==""){


let note =
document.createElement("p");


note.innerHTML =
"📝 " + input.value;


list.appendChild(note);


input.value="";


}


}







function saveLanguage(){


const lang =
document.getElementById("language");



if(lang){

localStorage.setItem(
"haldoLanguage",
lang.value
);


alert(
"🌍 Sprache gespeichert"
);


}


}