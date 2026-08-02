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

return;

}



let message =
input.value.trim();




if(message===""){

return;

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

return;

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

return;

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

return:

"Hallo 👋 Ich bin HalDo AI. Wie kann ich dir helfen?";

}





if(
text.includes("name")
){

return:

"Ich bin HalDo AI, dein intelligenter Assistent im HalDo AI OS.";

}





if(
text.includes("zeit")
){

return:

"Die aktuelle Uhrzeit wird oben im System angezeigt.";

}





if(
text.includes("pdf")
){

return:

"Der PDF Creator ist bereit. Du kannst später Dokumente als PDF erstellen.";

}





return:

"Ich habe deine Nachricht erhalten. Meine KI-Funktionen werden weiter ausgebaut. 🚀";



}