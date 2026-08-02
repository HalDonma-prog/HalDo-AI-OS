// ==================================
// HALDO AI OS v7.3
// COMPLETE SCRIPT
// ==================================



// START SPLASH


window.addEventListener(
"load",
function(){


const splash =
document.getElementById(
"splashScreen"
);



const welcome =
document.getElementById(
"welcomeScreen"
);



const main =
document.getElementById(
"mainOS"
);



if(main){

main.style.display="none";

}



setTimeout(
function(){


if(splash){

splash.style.display="none";

}



if(welcome){

welcome.style.display="flex";

}



},
2500
);



});






// ==================================
// START BUTTON
// ==================================



function startOS(){



const welcome =
document.getElementById(
"welcomeScreen"
);



const main =
document.getElementById(
"mainOS"
);



if(welcome){

welcome.style.display="none";

}



if(main){

main.style.display="block";

}



openPage(
"dashboard"
);



}








// ==================================
// NAVIGATION
// ==================================


function openPage(pageId){



const pages =
document.querySelectorAll(
".page"
);



pages.forEach(
function(page){


page.classList.remove(
"active"
);


});



const page =
document.getElementById(
pageId
);



if(page){


page.classList.add(
"active"
);


}



}









// ==================================
// AI
// ==================================


// ==================================
// HALDO AI ENGINE v8.0
// ==================================


function sendAI(){
// ==================================
// HALDO AI ENGINE v8.1
// CHAT SYSTEM
// ==================================



function sendAI(){


const input =
document.getElementById(
"aiInput"
);



if(
!input ||
input.value.trim()===""
){

return;

}



let text =
input.value;



addChatMessage(
text,
"user"
);



saveChat();



setTimeout(
function(){


let answer =
getHalDoAnswer(
text
);



addChatMessage(
answer,
"ai"
);



saveChat();


},
500
);



input.value="";


}







function addChatMessage(
text,
type
){


const history =
document.getElementById(
"chatHistory"
);



let box =
document.createElement(
"div"
);



box.className =
"chat-message " +
(type==="user"
?
"user-message"
:
"ai-message");



let time =
new Date()
.toLocaleTimeString(
"de-DE",
{
hour:"2-digit",
minute:"2-digit"
}
);



box.innerHTML =
text +
"<div class='ai-time'>"
+
time
+
"</div>";



history.appendChild(
box
);



history.scrollTop =
history.scrollHeight;


}







function getHalDoAnswer(
message
){


message =
message.toLowerCase();



if(
message.includes("hallo")
){

return "Hallo 👋 Schön dich zu sehen. Ich bin HalDo AI.";

}



if(
message.includes("name")
){

return "Ich bin HalDo AI Engine v8.1.";

}



if(
message.includes("hilfe")
){

return "Ich kann dir später mit Dateien, Schreiben, PDF und vielen Aufgaben helfen.";

}



return "Ich habe deine Nachricht verstanden und werde immer weiter verbessert.";

}








function saveChat(){


let history =
document.getElementById(
"chatHistory"
);



if(history){

localStorage.setItem(
"haldoChat",
history.innerHTML
);


}


}








function loadChat(){


let history =
document.getElementById(
"chatHistory"
);



let saved =
localStorage.getItem(
"haldoChat"
);



if(
history &&
saved
){

history.innerHTML =
saved;

}


}








function clearChat(){


let history =
document.getElementById(
"chatHistory"
);



if(history){

history.innerHTML="";


}



localStorage.removeItem(
"haldoChat"
);


}








window.addEventListener(
"load",
function(){

loadChat();

});

function clearChat(){


const history =
document.getElementById(
"chatHistory"
);



if(history){


history.innerHTML =
"🤖 Chat gelöscht.";


}


}









// ==================================
// NOTES
// ==================================



function saveNote(){



const input =
document.getElementById(
"noteInput"
);



const list =
document.getElementById(
"noteList"
);



if(
input &&
list &&
input.value.trim()!==""
){



let note =
document.createElement(
"p"
);



note.innerHTML =
"📝 " +
input.value;



list.appendChild(
note
);



input.value="";


}



}








// ==================================
// PDF
// ==================================



function createPDF(){


alert(
"📄 PDF Creator wird vorbereitet"
);


}









// ==================================
// LANGUAGE
// ==================================



function saveLanguage(){



const language =
document.getElementById(
"language"
);



if(language){


localStorage.setItem(
"haldoLanguage",
language.value
);



alert(
"🌍 Sprache gespeichert"
);


}


}