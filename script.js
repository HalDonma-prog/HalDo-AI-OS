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