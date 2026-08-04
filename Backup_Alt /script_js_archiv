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
/* =====================================
   HALDO AI OS BROWSER v1.1
   CLEAN FINAL SCRIPT
   PART 3/4
===================================== */



/* =====================================
   FILE SYSTEM
===================================== */


const fileUpload =
document.getElementById(
"fileUpload"
);


const fileList =
document.getElementById(
"fileList"
);



if(fileUpload){


fileUpload.addEventListener(
"change",
()=>{


fileList.innerHTML="";



Array.from(
fileUpload.files
).forEach(file=>{


const item =
document.createElement(
"p"
);



item.innerHTML =
"📄 " + file.name;



fileList.appendChild(
item
);



});



}

);


}









/* =====================================
   WRITING SYSTEM
===================================== */


const writerText =
document.getElementById(
"writerText"
);



const saveDocument =
document.getElementById(
"saveDocument"
);



if(saveDocument){


saveDocument.addEventListener(
"click",
()=>{


localStorage.setItem(

"haldo_document",

writerText.value

);



alert(
"💾 Dokument gespeichert"
);



}

);


}



if(writerText){


const savedText =
localStorage.getItem(
"haldo_document"
);



if(savedText){

writerText.value =
savedText;

}


}









/* =====================================
   NOTES SYSTEM
===================================== */


const noteInput =
document.getElementById(
"noteInput"
);



const addNote =
document.getElementById(
"addNote"
);



const noteList =
document.getElementById(
"noteList"
);



let notes =
JSON.parse(
localStorage.getItem(
"haldo_notes"
)
)
|| [];





function showNotes(){


if(!noteList)
return;



noteList.innerHTML="";



notes.forEach(
(note,index)=>{


const box =
document.createElement(
"div"
);



box.className =
"ai-message";



box.innerHTML =

note +

" <button onclick='deleteNote("+index+")'>❌</button>";



noteList.appendChild(
box
);



});


}



window.deleteNote =
function(index){


notes.splice(
index,
1
);



localStorage.setItem(

"haldo_notes",

JSON.stringify(notes)

);



showNotes();



};







if(addNote){


addNote.addEventListener(
"click",
()=>{


if(!noteInput.value)
return;



notes.push(
noteInput.value
);



localStorage.setItem(

"haldo_notes",

JSON.stringify(notes)

);



noteInput.value="";


showNotes();



}

);


}



showNotes();









/* =====================================
   CALENDAR SYSTEM
===================================== */


const saveEvent =
document.getElementById(
"saveEvent"
);



const calendarList =
document.getElementById(
"calendarList"
);



let events =
JSON.parse(
localStorage.getItem(
"haldo_events"
)
)
|| [];





function showEvents(){


if(!calendarList)
return;



calendarList.innerHTML="";



events.forEach(event=>{


const item =
document.createElement(
"p"
);



item.innerHTML =
"📅 " + event;



calendarList.appendChild(
item
);



});


}





if(saveEvent){


saveEvent.addEventListener(
"click",
()=>{


const date =
document.getElementById(
"calendarDate"
).value;



const text =
document.getElementById(
"calendarEvent"
).value;



if(!text)
return;



events.push(

date +
" - " +
text

);



localStorage.setItem(

"haldo_events",

JSON.stringify(events)

);



showEvents();



}

);


}



showEvents();









console.log(
"💾 HalDo Storage System aktiv"
);
/* =====================================
   HALDO AI OS BROWSER v1.1
   CLEAN FINAL SCRIPT
   PART 4/4 FINAL
===================================== */


/* =====================================
   DARK MODE SYSTEM
===================================== */


const darkModeButton =
document.getElementById("darkModeButton");


const savedDarkMode =
localStorage.getItem("haldo_dark_mode");


if(savedDarkMode === "true"){

    document.body.classList.add(
        "dark-mode"
    );

}



if(darkModeButton){

    darkModeButton.addEventListener(
        "click",
        ()=>{

            document.body.classList.toggle(
                "dark-mode"
            );


            const active =
            document.body.classList.contains(
                "dark-mode"
            );


            localStorage.setItem(
                "haldo_dark_mode",
                active
            );


        }
    );

}









/* =====================================
   SETTINGS STORAGE
===================================== */


const userName =
document.getElementById("userName");


const userEmail =
document.getElementById("userEmail");



if(userName){

    userName.value =
    localStorage.getItem(
        "haldo_user_name"
    ) || "";


    userName.addEventListener(
        "change",
        ()=>{

            localStorage.setItem(
                "haldo_user_name",
                userName.value
            );

        }
    );

}



if(userEmail){

    userEmail.value =
    localStorage.getItem(
        "haldo_user_email"
    ) || "";


    userEmail.addEventListener(
        "change",
        ()=>{

            localStorage.setItem(
                "haldo_user_email",
                userEmail.value
            );

        }
    );

}









/* =====================================
   SYSTEM STATUS
===================================== */


const securityStatus =
document.getElementById(
    "securityStatus"
);



if(securityStatus){

    securityStatus.innerHTML =
    "Aktiv 💙";

}









/* =====================================
   VOICE AI PREPARATION
===================================== */


window.HalDoVoice = {

    enabled:false,


    start(){

        console.log(
            "🎤 HalDo Voice vorbereitet"
        );

    }

};









/* =====================================
   NOTIFICATION CENTER
===================================== */


window.haldoNotification =
function(message){


    const list =
    document.getElementById(
        "notificationList"
    );


    if(!list)
    return;


    const item =
    document.createElement(
        "p"
    );


    item.innerHTML =
    "🔔 " + message;


    list.appendChild(
        item
    );


};









/* =====================================
   HALDO FINAL START
===================================== */


setTimeout(
()=>{


console.log(
"🌌 Das ist HalDo AI OS."
);


if(window.haldoNotification){

    haldoNotification(
        "HalDo AI OS erfolgreich gestartet"
    );

}


},
1500
);







console.log(
"🚀 HalDo AI OS Browser v1.1 CLEAN FINAL aktiv"
);