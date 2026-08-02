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
input.value.trim()!==""
){



let user =
document.createElement(
"p"
);



user.innerHTML =
"👤 " +
input.value;



history.appendChild(
user
);




let ai =
document.createElement(
"p"
);



ai.innerHTML =
"🤖 HalDo AI: Ich bin bereit.";



history.appendChild(
ai
);



input.value="";


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