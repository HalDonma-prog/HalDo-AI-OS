/* =====================================
   HALDO AI OS BROWSER v1.1
   CLEAN FINAL SCRIPT
   PART 1/4
===================================== */


/* =====================================
   HALDO SYSTEM START
===================================== */


document.addEventListener(
"DOMContentLoaded",
() => {


console.log(
"💙 HalDo AI OS gestartet"
);



/*
   HalDo Identity Core

   H + AI + Stern Logo System
*/

const HalDoCore = {

    name: "HalDo AI OS",

    version: "v1.1",

    symbol: "H★AI",

    status: "online"


};



window.HalDoCore = HalDoCore;









/* =====================================
   BOOT EXPERIENCE
===================================== */


const boot = document.getElementById(
"haldoBoot"
);



if(boot){

setTimeout(()=>{


boot.style.display="none";


},3000);


}









/* =====================================
   NAVIGATION SYSTEM
===================================== */


const buttons = document.querySelectorAll(
".nav-button"
);



const pages = document.querySelectorAll(
".page"
);



buttons.forEach(button => {



button.addEventListener(
"click",
()=>{


const target =
button.dataset.page;



if(!target) return;





pages.forEach(page=>{


page.classList.remove(
"active"
);


});





const selected =
document.getElementById(
target
);



if(selected){


selected.classList.add(
"active"
);


}





buttons.forEach(btn=>{


btn.classList.remove(
"active"
);


});





button.classList.add(
"active"
);





console.log(
"HalDo Navigation:",
target
);



}

);



});









/* =====================================
   START MESSAGE
===================================== */


setTimeout(()=>{


const startMessage = {


de:
"💙 HalDo AI OS gestartet. Willkommen zurück.",


tr:
"💙 HalDo AI OS başladı. Hoş geldiniz.",


ku:
"💙 HalDo AI OS dest pê kir. Bi xêr hatî.",


en:
"💙 HalDo AI OS started. Welcome back."


};



window.HalDoWelcome =
startMessage;



},
500);





});
/* =====================================
   HALDO AI OS BROWSER v1.1
   CLEAN FINAL SCRIPT
   PART 2/4
===================================== */



/* =====================================
   LANGUAGE SYSTEM
===================================== */


let haldoLanguage = "de";



const translations = {


de: {

hello:
"Hallo 💙 Ich bin HalDo AI. Wie kann ich dir helfen?",

joke:
"Warum können Computer nicht schlafen? Weil sie immer im Netzwerk bleiben. 😄",

files:
"📁 Der Datei-Bereich ist geöffnet.",

ready:
"💙 HalDo AI OS ist bereit."


},



tr: {

hello:
"Merhaba 💙 Ben HalDo AI. Sana nasıl yardımcı olabilirim?",

joke:
"Bilgisayar neden uyuyamaz? Çünkü sürekli ağda kalır. 😄",

files:
"📁 Dosya bölümü açıldı.",

ready:
"💙 HalDo AI OS hazır."


},



ku: {

hello:
"Silav 💙 Ez HalDo AI me. Ez çawa dikarim alîkarî bikim?",

joke:
"Çima komputer naxwaze razê? Ji ber ku her tim di torê de ye. 😄",

files:
"📁 Beşa pelan hate vekirin.",

ready:
"💙 HalDo AI OS amade ye."


},



en: {

hello:
"Hello 💙 I am HalDo AI. How can I help you?",

joke:
"Why don't computers sleep? Because they stay connected. 😄",

files:
"📁 File section opened.",

ready:
"💙 HalDo AI OS is ready."


}


};









/* =====================================
   CHANGE LANGUAGE
===================================== */


const languageSelect =
document.getElementById(
"languageSelect"
);



if(languageSelect){


languageSelect.addEventListener(
"change",
()=>{


const value =
languageSelect.value;



if(value==="de-DE")
haldoLanguage="de";


if(value==="tr-TR")
haldoLanguage="tr";


if(value==="fr-FR")
haldoLanguage="en";


if(value==="es-ES")
haldoLanguage="en";



if(value==="ku")
haldoLanguage="ku";



console.log(
"HalDo Language:",
haldoLanguage
);



}

);


}









/* =====================================
   CHAT ENGINE
===================================== */


const chatInput =
document.getElementById(
"chatInput"
);



const sendButton =
document.getElementById(
"sendMessage"
);



const chatContainer =
document.getElementById(
"chatContainer"
);









function addMessage(
text,
type
){



if(!chatContainer)
return;



const div =
document.createElement(
"div"
);



div.className =
type;



div.innerHTML =
text;



chatContainer.appendChild(
div
);



chatContainer.scrollTop =
chatContainer.scrollHeight;



}









function haldoReply(
message
){



const text =
message.toLowerCase();





if(
text.includes("hallo") ||
text.includes("hi") ||
text.includes("hey")
){


return translations[
haldoLanguage
].hello;


}






if(
text.includes("witz") ||
text.includes("joke")
){


return translations[
haldoLanguage
].joke;


}






if(
text.includes("datei") ||
text.includes("file")
){


return translations[
haldoLanguage
].files;


}







return translations[
haldoLanguage
].ready;



}









if(sendButton){


sendButton.addEventListener(
"click",
()=>{



const message =
chatInput.value.trim();





if(!message)
return;





addMessage(
message,
"user-message"
);



chatInput.value="";





setTimeout(
()=>{


const answer =
haldoReply(
message
);



addMessage(
answer,
"ai-message"
);



},
500
);



}

);


}



if(chatInput){


chatInput.addEventListener(
"keydown",
(e)=>{


if(e.key==="Enter"){


sendButton.click();


}


}

);


}