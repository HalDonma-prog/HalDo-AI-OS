/* =====================================
   HALDO AI OS v9.0
   MAIN SYSTEM ENGINE
   PART 1/8
   ===================================== */



// =====================================
// SYSTEM START
// =====================================


window.onload = function(){


console.log(
"🌍 HalDo AI OS v9.0 gestartet"
);



setTimeout(()=>{


document.getElementById(
"bootScreen"
).style.display="none";


document.getElementById(
"welcomeScreen"
).style.display="flex";


},3500);



updateClock();


setInterval(
updateClock,
1000
);


};







// =====================================
// START OS
// =====================================


function startOS(){


document.getElementById(
"welcomeScreen"
).style.display="none";


document.getElementById(
"desktop"
).style.display="block";



openApp(
"dashboard"
);



showNotification(
"🚀 HalDo AI OS gestartet"
);



}








// =====================================
// CLOCK
// =====================================


function updateClock(){


let now =
new Date();



let time =
now.toLocaleTimeString(
"de-DE"
);



let clock =
document.getElementById(
"clock"
);



let systemTime =
document.getElementById(
"systemTime"
);



if(clock){

clock.innerHTML=time;

}



if(systemTime){

systemTime.innerHTML=time;

}



}








// =====================================
// APP NAVIGATION
// =====================================


function openApp(appName){


let windows =
document.querySelectorAll(
".window"
);



windows.forEach(
window=>{

window.classList.remove(
"active"
);

});



let app =
document.getElementById(
appName
);



if(app){

app.classList.add(
"active"
);

}


}
/* =====================================
   HALDO AI CHAT ENGINE
   PART 2/8
   ===================================== */





let chatMemory = [];







// =====================================
// SEND AI MESSAGE
// =====================================


function sendAI(){



let input =
document.getElementById(
"aiInput"
);



if(!input){

return "...";

}



let message =
input.value.trim();




if(message===""){

return "...";

}




addUserMessage(
message
);



input.value="";




setTimeout(()=>{


let answer =
generateAIResponse(
message
);



addAIMessage(
answer
);



},800);



}









// =====================================
// ADD USER MESSAGE
// =====================================


function addUserMessage(text){



let container =
document.getElementById(
"chatHistory"
);



if(!container){

return "...";

}




let box =
document.createElement(
"div"
);



box.className=
"user-message";



box.innerHTML=`

<div class="chat-bubble">

<h4>

Du

</h4>


<p>

${text}

</p>


</div>

`;



container.appendChild(
box
);



chatMemory.push({

type:"user",

text:text

});



container.scrollTop =
container.scrollHeight;


}









// =====================================
// ADD AI MESSAGE
// =====================================


function addAIMessage(text){



let container =
document.getElementById(
"chatHistory"
);



if(!container){

return "...";

}



let box =
document.createElement(
"div"
);



box.className=
"ai-message";



box.innerHTML=`

<div class="chat-avatar">

🤖

</div>


<div class="chat-bubble">


<h4>

HalDo AI

</h4>


<p>

${text}

</p>


<span class="chat-time">

Jetzt

</span>


</div>

`;



container.appendChild(
box
);



chatMemory.push({

type:"ai",

text:text

});



container.scrollTop =
container.scrollHeight;


}









// =====================================
// AI RESPONSE SYSTEM
// =====================================


function generateAIResponse(message){



let text =
message.toLowerCase();





if(
text.includes("hallo")
||
text.includes("hi")
){

return "...";

"Hallo 👋 Ich bin HalDo AI. Wie kann ich dir helfen?";

}





if(
text.includes("name")
){



"Ich bin HalDo AI, dein intelligenter Assistent im HalDo AI OS.";

}





if(
text.includes("zeit")
){

return "...";

"Die aktuelle Uhrzeit wird oben im System angezeigt.";

}





if(
text.includes("pdf")
){

return "...";

"Der PDF Creator ist bereit. Du kannst später Dokumente als PDF erstellen.";

}





return "...";

"Ich habe deine Nachricht erhalten. Meine KI-Funktionen werden weiter ausgebaut. 🚀";



}
/* =====================================
   VOICE + STORAGE SYSTEM
   PART 3/8
   ===================================== */






// =====================================
// VOICE INPUT PREPARATION
// =====================================


function startVoiceInput(){



if(
"webkitSpeechRecognition" in window
){



let recognition =
new webkitSpeechRecognition();



recognition.lang =
"de-DE";



recognition.start();




recognition.onresult =
function(event){



let text =
event.results[0][0].transcript;



let input =
document.getElementById(
"aiInput"
);



if(input){

input.value=text;

}



};



}else{



showNotification(
"🎤 Sprachfunktion wird vorbereitet"
);



}



}








// =====================================
// TEXT TO SPEECH
// =====================================


function speakLastAnswer(){



let messages =
document.querySelectorAll(
".ai-message .chat-bubble p"
);



if(
messages.length===0
){

return "...";

}




let last =
messages[
messages.length-1
].innerText;



let speech =
new SpeechSynthesisUtterance(
last
);



speech.lang =
"de-DE";



speech.rate =
1;



speech.pitch =
1;



speechSynthesis.speak(
speech
);



}








// =====================================
// CLEAR CHAT
// =====================================


function clearChat(){



let container =
document.getElementById(
"chatHistory"
);



if(container){



container.innerHTML=`


<div class="ai-message">


<div class="chat-avatar">

🤖

</div>


<div class="chat-bubble">


<h4>

HalDo AI

</h4>


<p>

Chat wurde gelöscht. Wie kann ich helfen?

</p>


</div>


</div>



`;



}




chatMemory=[];



showNotification(
"🗑️ Chat gelöscht"
);



}








// =====================================
// WRITING SAVE
// =====================================


function saveWriting(){



let text =
document.getElementById(
"writingArea"
);



if(text){



localStorage.setItem(

"haldoWriting",

text.value

);



showNotification(
"💾 Dokument gespeichert"
);



}



}








// =====================================
// LOAD WRITING
// =====================================


function loadWriting(){



let text =
document.getElementById(
"writingArea"
);



let saved =
localStorage.getItem(
"haldoWriting"
);



if(
text &&
saved
){



text.value=saved;



}



}






// =====================================
// NOTE SYSTEM
// =====================================


function saveNote(){



let input =
document.getElementById(
"noteInput"
);



if(
!input ||
input.value.trim()===""
){

return "...";

}



let notes =
JSON.parse(

localStorage.getItem(
"haldoNotes"
)

)

|| [];



notes.push(
input.value
);



localStorage.setItem(

"haldoNotes",

JSON.stringify(notes)

);



input.value="";



loadNotes();



showNotification(
"📝 Notiz gespeichert"
);



}








function loadNotes(){



let list =
document.getElementById(
"noteList"
);



if(!list){

return "...";

}



let notes =
JSON.parse(

localStorage.getItem(
"haldoNotes"

)

)

|| [];



list.innerHTML="";



notes.forEach(
note=>{



let item =
document.createElement(
"p"
);



item.innerText =
"📝 "+note;



list.appendChild(
item
);



}



);



}
/* =====================================
   VOICE + STORAGE SYSTEM
   PART 3/8
   ===================================== */






// =====================================
// VOICE INPUT PREPARATION
// =====================================


function startVoiceInput(){



if(
"webkitSpeechRecognition" in window
){



let recognition =
new webkitSpeechRecognition();



recognition.lang =
"de-DE";



recognition.start();




recognition.onresult =
function(event){



let text =
event.results[0][0].transcript;



let input =
document.getElementById(
"aiInput"
);



if(input){

input.value=text;

}



};



}else{



showNotification(
"🎤 Sprachfunktion wird vorbereitet"
);



}



}








// =====================================
// TEXT TO SPEECH
// =====================================


function speakLastAnswer(){



let messages =
document.querySelectorAll(
".ai-message .chat-bubble p"
);



if(
messages.length===0
){

return;

}




let last =
messages[
messages.length-1
].innerText;



let speech =
new SpeechSynthesisUtterance(
last
);



speech.lang =
"de-DE";



speech.rate =
1;



speech.pitch =
1;



speechSynthesis.speak(
speech
);



}








// =====================================
// CLEAR CHAT
// =====================================


function clearChat(){



let container =
document.getElementById(
"chatHistory"
);



if(container){



container.innerHTML=`


<div class="ai-message">


<div class="chat-avatar">

🤖

</div>


<div class="chat-bubble">


<h4>

HalDo AI

</h4>


<p>

Chat wurde gelöscht. Wie kann ich helfen?

</p>


</div>


</div>



`;



}




chatMemory=[];



showNotification(
"🗑️ Chat gelöscht"
);



}








// =====================================
// WRITING SAVE
// =====================================


function saveWriting(){



let text =
document.getElementById(
"writingArea"
);



if(text){



localStorage.setItem(

"haldoWriting",

text.value

);



showNotification(
"💾 Dokument gespeichert"
);



}



}








// =====================================
// LOAD WRITING
// =====================================


function loadWriting(){



let text =
document.getElementById(
"writingArea"
);



let saved =
localStorage.getItem(
"haldoWriting"
);



if(
text &&
saved
){



text.value=saved;



}



}






// =====================================
// NOTE SYSTEM
// =====================================


function saveNote(){



let input =
document.getElementById(
"noteInput"
);



if(
!input ||
input.value.trim()===""
){

return;

}



let notes =
JSON.parse(

localStorage.getItem(
"haldoNotes"
)

)

|| [];



notes.push(
input.value
);



localStorage.setItem(

"haldoNotes",

JSON.stringify(notes)

);



input.value="";



loadNotes();



showNotification(
"📝 Notiz gespeichert"
);



}








function loadNotes(){



let list =
document.getElementById(
"noteList"
);



if(!list){

return;

}



let notes =
JSON.parse(

localStorage.getItem(
"haldoNotes"

)

)

|| [];



list.innerHTML="";



notes.forEach(
note=>{



let item =
document.createElement(
"p"
);



item.innerText =
"📝 "+note;



list.appendChild(
item
);



}



);



}
/* =====================================
   FILES + PDF + SETTINGS SYSTEM
   PART 4/8
   ===================================== */






// =====================================
// FILE UPLOAD
// =====================================


function uploadFile(){


let input =
document.getElementById(
"fileUpload"
);



if(
!input ||
!input.files.length
){

showNotification(
"📁 Keine Datei ausgewählt"
);

return;

}



let file =
input.files[0];



let list =
document.getElementById(
"fileList"
);



if(list){


let item =
document.createElement(
"div"
);



item.className =
"file-item";



item.innerHTML = `

<span>

📄 ${file.name}

</span>


<span>

${Math.round(file.size/1024)}
 KB

</span>

`;



list.appendChild(
item
);


}



showNotification(
"📁 Datei hinzugefügt"
);



}









// =====================================
// PDF CREATOR PREPARATION
// =====================================


function createPDF(){



let text =
document.getElementById(
"pdfInput"
);



if(
!text ||
text.value.trim()===""
){

showNotification(
"📄 Bitte Inhalt eingeben"
);

return;

}



let content =
text.value;



let blob =
new Blob(
[
content
],
{
type:
"text/plain"
}
);



let link =
document.createElement(
"a"
);



link.href =
URL.createObjectURL(
blob
);



link.download =
"HalDo_Dokument.txt";



link.click();



showNotification(
"📄 Dokument erstellt"
);



}








// =====================================
// USER SETTINGS
// =====================================


function saveUser(){



let name =
document.getElementById(
"username"
);



if(name){


localStorage.setItem(

"haldoUser",

name.value

);



showNotification(
"👤 Benutzer gespeichert"
);



}


}









// =====================================
// LANGUAGE
// =====================================


function saveLanguage(){



let lang =
document.getElementById(
"language"
);



if(lang){


localStorage.setItem(

"haldoLanguage",

lang.value

);



showNotification(
"🌍 Sprache gespeichert"
);



}


}








// =====================================
// DARK MODE
// =====================================


function toggleDarkMode(){



document.body.classList.toggle(
"dark-mode"
);



localStorage.setItem(

"haldoDark",

document.body.classList.contains(
"dark-mode"
)

);



showNotification(
"🌙 Design geändert"
);



}







function loadSettings(){



let dark =
localStorage.getItem(
"haldoDark"
);



if(
dark==="true"
){

document.body.classList.add(
"dark-mode"
);

}




let name =
localStorage.getItem(
"haldoUser"
);



let username =
document.getElementById(
"username"
);



if(
username &&
name
){

username.value=name;

}



}
/* =====================================
   SYSTEM SERVICES
   PART 5/8
   ===================================== */






// =====================================
// NOTIFICATION SYSTEM
// =====================================


function showNotification(message){



let box =
document.getElementById(
"notification"
);



if(!box){

return;

}



box.innerHTML =
message;



box.style.display =
"block";



setTimeout(()=>{


box.style.display =
"none";


},3000);



}








// =====================================
// AUTO LOAD SYSTEM
// =====================================


function autoLoad(){



loadNotes();



loadWriting();



loadSettings();



showNotification(
"⚡ System geladen"
);



}








// =====================================
// MOBILE CHECK
// =====================================


function checkMobile(){



let mobile =
window.innerWidth < 900;



if(mobile){



console.log(
"📱 Mobile Modus aktiv"
);



}else{



console.log(
"🖥️ Desktop Modus aktiv"
);



}



}









// =====================================
// RESPONSIVE LISTENER
// =====================================


window.addEventListener(
"resize",
function(){


checkMobile();


});








// =====================================
// SYSTEM CLEANUP
// =====================================


function clearSystemCache(){



chatMemory=[];



localStorage.removeItem(
"temporaryData"
);



showNotification(
"🚀 System optimiert"
);



}








// =====================================
// SAFE START
// =====================================


window.addEventListener(
"load",
function(){



autoLoad();



checkMobile();



});








// =====================================
// KEYBOARD SHORTCUTS
// =====================================


document.addEventListener(
"keydown",
function(event){



// ESC = Dashboard


if(
event.key==="Escape"
){


openApp(
"dashboard"
);


}



// STRG + K = AI


if(
event.ctrlKey &&
event.key==="k"
){


openApp(
"ai"
);


}



});
/* =====================================
   DESKTOP + WINDOW CONTROL
   PART 6/8
   ===================================== */






// =====================================
// CLOSE ALL WINDOWS
// =====================================


function closeAllApps(){



let windows =
document.querySelectorAll(
".window"
);



windows.forEach(
item=>{


item.classList.remove(
"active"
);


});


}









// =====================================
// IMPROVED APP OPEN
// =====================================


function switchApp(appName){



closeAllApps();



let app =
document.getElementById(
appName
);



if(app){


app.classList.add(
"active"
);


}



}









// =====================================
// GO HOME
// =====================================


function goHome(){



switchApp(
"dashboard"
);



showNotification(
"🏠 Startseite"
);



}








// =====================================
// DOCK ACTIONS
// =====================================


function dockOpen(app){



switchApp(
app
);



showNotification(
"🚀 App geöffnet"
);



}









// =====================================
// WINDOW MEMORY
// =====================================


let lastOpenedApp =
"dashboard";




function rememberApp(app){



lastOpenedApp =
app;



localStorage.setItem(

"lastApp",

app

);



}









// =====================================
// RESTORE LAST APP
// =====================================


function restoreLastApp(){



let app =
localStorage.getItem(
"lastApp"
);



if(app){



switchApp(
app
);



}



}









// =====================================
// DOUBLE CLICK DESKTOP
// =====================================


document.addEventListener(
"dblclick",
function(event){



let target =
event.target.closest(
".desktop-icon"
);



if(target){



target.style.transform =
"scale(1.15)";



setTimeout(()=>{


target.style.transform =
"";


},200);



}



});








// =====================================
// TOUCH SUPPORT MOBILE
// =====================================


let touchStart = 0;



document.addEventListener(
"touchstart",
function(event){



touchStart =
event.changedTouches[0].screenX;



});





document.addEventListener(
"touchend",
function(event){



let touchEnd =
event.changedTouches[0].screenX;



if(
touchEnd - touchStart > 120
){


showNotification(
"⬅️ Zurück Geste erkannt"
);



}



});
/* =====================================
   AI MEMORY + FUTURE MODULES
   PART 7/8
   ===================================== */






// =====================================
// AI MEMORY SYSTEM
// =====================================


let aiMemory = [];






function saveAIMemory(data){



aiMemory.push(
data
);



localStorage.setItem(

"haldoAIMemory",

JSON.stringify(
aiMemory
)

);



}







function loadAIMemory(){



let saved =
localStorage.getItem(
"haldoAIMemory"
);



if(saved){



aiMemory =
JSON.parse(
saved
);



}



}







function clearAIMemory(){



aiMemory=[];



localStorage.removeItem(
"haldoAIMemory"
);



showNotification(
"🧠 AI Speicher gelöscht"
);



}









// =====================================
// LANGUAGE SYSTEM
// =====================================


const languages = {



de:{

welcome:
"Willkommen",

start:
"HalDo starten"

},



en:{

welcome:
"Welcome",

start:
"Start HalDo"

},



tr:{

welcome:
"Hoş geldiniz",

start:
"HalDo başlat"

},



ar:{

welcome:
"مرحبا",

start:
"ابدأ HalDo"

}



};








function translate(key){



let current =
localStorage.getItem(
"haldoLanguage"
)

|| "de";



if(
languages[current]
&&
languages[current][key]
){


return languages[current][key];


}



return key;



}









// =====================================
// SECURITY PREPARATION
// =====================================


function securityCheck(){



console.log(
"🔐 Security check running"
);



return true;



}








function lockSystem(){



document.body.style.filter =
"blur(5px)";



showNotification(
"🔒 System gesperrt"
);



}








function unlockSystem(){



document.body.style.filter =
"none";



showNotification(
"🔓 System entsperrt"
);



}









// =====================================
// FUTURE MODULE LOADER
// =====================================


const futureModules = {



camera:false,



cloud:false,



store:false,



advancedAI:false,



robot:false



};







function enableModule(name){



futureModules[name]=true;



console.log(

"🚀 Modul aktiviert:",
name

);



}
/* =====================================
   SYSTEM FINALIZATION
   PART 8/8
   ===================================== */





// =====================================
// ERROR CHECK
// =====================================


function systemCheck(){



let required = [


"bootScreen",

"welcomeScreen",

"desktop",

"workspace"


];



let missing=[];



required.forEach(
(id)=>{


if(
!document.getElementById(id)
){


missing.push(id);


}


});




if(
missing.length>0
){



console.warn(

"⚠️ Fehlende Elemente:",
missing

);



return false;



}



console.log(

"✅ System Check erfolgreich"

);



return true;



}








// =====================================
// START OPTIMIZATION
// =====================================


function optimizeSystem(){



loadAIMemory();



loadSettings();



loadNotes();



loadWriting();



systemCheck();



console.log(

"🚀 HalDo AI OS optimiert"

);



}








// =====================================
// INITIALIZE SYSTEM
// =====================================


function initializeHalDo(){



securityCheck();



optimizeSystem();



restoreLastApp();



console.log(

"🌍 HalDo AI OS v9.0 bereit"

);



}








// =====================================
// SAVE LAST APP
// =====================================


function saveLastApp(app){



localStorage.setItem(

"lastApp",

app

);



}








// =====================================
// UPDATE NAVIGATION MEMORY
// =====================================


const originalOpenApp =
openApp;



openApp =
function(appName){



originalOpenApp(
appName
);



saveLastApp(
appName
);



};








// =====================================
// FINAL START
// =====================================


setTimeout(()=>{



initializeHalDo();



},1000);








/* =====================================
   END OF HALDO AI OS v9.0
   ===================================== */