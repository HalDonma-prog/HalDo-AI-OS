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


const input =
document.getElementById(
"aiInput"
);


const history =
document.getElementById(
"chatHistory"
);



if(
!input ||
!history ||
input.value.trim()===""
){

return;

}



let userMessage =
input.value;



addMessage(
"👤 Du: " + userMessage
);



let answer =
getHalDoAnswer(
userMessage
);



addMessage(
"🤖 HalDo AI: " + answer
);



input.value="";


}




function addMessage(text){


const history =
document.getElementById(
"chatHistory"
);


let message =
document.createElement(
"p"
);



message.innerHTML =
text;



history.appendChild(
message
);



history.scrollTop =
history.scrollHeight;


}






function getHalDoAnswer(message){


message =
message.toLowerCase();



if(
message.includes("hallo")
||
message.includes("hi")
){

return "Hallo 👋 Ich bin HalDo AI und bereit zu helfen.";

}



if(
message.includes("wer bist du")
){

return "Ich bin HalDo AI, dein digitaler Assistent.";

}



if(
message.includes("zeit")
){

return "Die Zeit kann ich später mit dem System verbinden.";

}



if(
message.includes("danke")
){

return "Sehr gerne 😊";

}



return "Ich habe deine Nachricht erhalten. Meine KI-Funktionen werden weiter ausgebaut.";


}







function speakAI(){


const history =
document.getElementById(
"chatHistory"
);



if(!history){

return;

}



let text =
history.innerText;



if(
"speechSynthesis" in window
){


let speech =
new SpeechSynthesisUtterance(
text
);


speech.lang =
"de-DE";


speechSynthesis.speak(
speech
);


}


}







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