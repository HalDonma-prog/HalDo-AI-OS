// ===============================
// HALDO AI OS v7.0
// STARTSYSTEM
// ===============================



window.addEventListener(
"load",
function(){


const splash =
document.getElementById(
"splashScreen"
);



if(splash){


setTimeout(
function(){


splash.style.display =
"none";


const welcome =
document.getElementById(
"welcomeScreen"
);


if(welcome){

welcome.style.display =
"flex";

}


},
2500
);


}



});





// ===============================
// START BUTTON
// ===============================



function startOS(){



const welcome =
document.getElementById(
"welcomeScreen"
);



const mainOS =
document.getElementById(
"mainOS"
);



if(welcome){

welcome.style.display =
"none";

}



if(mainOS){

mainOS.style.display =
"block";

}



openPage(
"dashboard"
);



}
// ===============================
// SEITEN WECHSEL
// ===============================



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



const selected =
document.getElementById(
pageId
);



if(selected){

selected.classList.add(
"active"
);

}



}






// ===============================
// HALDO AI CHAT
// ===============================



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
input &&
history &&
input.value.trim() !== ""
){


const message =
document.createElement(
"p"
);


message.innerHTML =
"👤 " +
input.value;



history.appendChild(
message
);



const answer =
document.createElement(
"p"
);


answer.innerHTML =
"🤖 HalDo AI ist bereit.";



history.appendChild(
answer
);



input.value =
"";


}


}
// ===============================
// NOTIZEN SPEICHERN
// ===============================


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
input.value.trim() !== ""
){


const note =
document.createElement(
"div"
);


note.innerHTML =
"📝 " +
input.value;



list.appendChild(
note
);



input.value =
"";


}



}





// ===============================
// SPRACHE SPEICHERN
// ===============================


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





// ===============================
// PDF VORBEREITUNG
// ===============================


function createPDF(){


alert(
"📄 PDF Creator vorbereitet"
);


}