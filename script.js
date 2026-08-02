/* =====================================
   HALDO AI OS v9.1
   SCRIPT SYSTEM
   PART 1
   AI ENGINE CORE
   ===================================== */



// =====================================
// HALDO SYSTEM START
// =====================================


const HalDoSystem = {

    version: "v9.1",

    name: "HalDo AI OS",

    started: false,


    start(){

        this.started = true;

        console.log(
            "🚀 HalDo AI OS gestartet"
        );

        loadMemory();

        welcomeAI();

    }

};








// =====================================
// AI ENGINE KERN
// =====================================


const HalDoAI = {


    name:"HalDo",

    memory:[],


    respond(message){


        let text =
        message.toLowerCase();



        if(
            text.includes("hallo") ||
            text.includes("hi")
        ){

            return "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen? 🤖";

        }



        if(
            text.includes("wer bist du")
        ){

            return "Ich bin HalDo AI, dein persönlicher digitaler Assistent.";

        }



        if(
            text.includes("zeit")
        ){

            return "Die aktuelle Zeit ist: "
            +
            new Date().toLocaleTimeString();

        }



        return "Ich habe dich verstanden. Meine Funktionen werden weiter ausgebaut. 🚀";


    }


};









// =====================================
// START BEGRÜSSUNG
// =====================================


function welcomeAI(){


    console.log(
        "🤖 HalDo AI bereit"
    );


    if(
        localStorage.getItem("haldoVoice")
        !==
        "off"
    ){

        speak(
            "Willkommen bei HalDo AI OS"
        );

    }


}









// =====================================
// NAVIGATION
// =====================================


function openWindow(id){


    let windows =
    document.querySelectorAll(
        ".window"
    );


    windows.forEach(
        win=>{

            win.classList.remove(
                "active"
            );

        }

    );


    let target =
    document.getElementById(id);



    if(target){

        target.classList.add(
            "active"
        );

    }


}








function closeWindows(){


    document
    .querySelectorAll(
        ".window"
    )
    .forEach(

        win=>{

            win.classList.remove(
                "active"
            );

        }

    );


}









// =====================================
// HAUPTMENÜ
// =====================================


function toggleMenu(){


    const menu =
    document.getElementById(
        "mainMenu"
    );


    if(menu){

        menu.classList.toggle(
            "active"
        );

    }


}









// =====================================
// CHAT ENGINE
// =====================================


function sendAIMessage(){


    const input =
    document.getElementById(
        "userInput"
    );


    if(!input) return;



    let message =
    input.value;



    if(
        message.trim()===""
    ){

        return;

    }



    let answer =
    HalDoAI.respond(
        message
    );



    saveMemory(
        message
    );



    console.log(
        answer
    );


    input.value="";


}









// =====================================
// SPEICHER BASIS
// =====================================


function saveMemory(data){


    if(!data)
    return;



    HalDoAI.memory.push(
        data
    );


    localStorage.setItem(

        "haldoMemory",

        JSON.stringify(
            HalDoAI.memory
        )

    );


}







function loadMemory(){


    let saved =
    localStorage.getItem(
        "haldoMemory"
    );



    if(saved){


        HalDoAI.memory =
        JSON.parse(
            saved
        );


    }


}









// =====================================
// SYSTEM LADEN
// =====================================


window.addEventListener(

"load",

()=>{

    HalDoSystem.start();

}

);
/* =====================================
   HALDO AI OS v9.1
   CHAT + VOICE ENGINE
   PART 2
   ===================================== */





// =====================================
// CHAT OBERFLÄCHE
// =====================================


function addMessage(
    sender,
    message
){


    const chat =
    document.getElementById(
        "chat"
    );


    if(!chat)
    return;



    const box =
    document.createElement(
        "div"
    );


    box.className =
    sender === "user"
    ?
    "user-message"
    :
    "ai-message";



    box.innerHTML = `

        <div class="chat-bubble">

        <strong>
        ${sender === "user" ? "Du" : "HalDo AI"}
        </strong>

        <br>

        ${message}

        </div>

    `;



    chat.appendChild(
        box
    );


    chat.scrollTop =
    chat.scrollHeight;


}









// =====================================
// NACHRICHTEN SENDEN
// =====================================


function sendMessage(){


    const input =
    document.getElementById(
        "userInput"
    );


    if(!input)
    return;



    let message =
    input.value.trim();



    if(message === "")
    return;



    addMessage(
        "user",
        message
    );



    saveMemory(
        message
    );



    setTimeout(
        ()=>{


            let answer =
            createAIAnswer(
                message
            );



            addMessage(
                "ai",
                answer
            );


            speak(
                answer
            );


        },

        500

    );



    input.value = "";

}









// =====================================
// VERBESSERTE AI ANTWORTEN
// =====================================


function createAIAnswer(
    message
){


    let text =
    message.toLowerCase();




    if(
        text.includes(
            "hallo"
        )
        ||
        text.includes(
            "hi"
        )
    ){

        return "Hallo! Schön dich wieder zu sehen. Ich bin HalDo AI.";

    }




    if(
        text.includes(
            "hilfe"
        )
    ){

        return "Ich kann dich bei Dateien, Einstellungen, Schreiben, Planung und weiteren Funktionen unterstützen.";

    }




    if(
        text.includes(
            "datei"
        )
    ){

        return "Das Datei-System wird vorbereitet. Ich helfe dir später beim Verwalten deiner Dateien.";

    }




    if(
        text.includes(
            "einstellung"
        )
    ){

        return "Die Einstellungen von HalDo AI OS können angepasst werden.";

    }




    if(
        text.includes(
            "danke"
        )
    ){

        return "Gerne! Ich bin für dich da.";

    }




    return (
        "Ich habe deine Nachricht gespeichert. "
        +
        "Meine AI-Funktionen werden weiter erweitert."
    );


}









// =====================================
// TEXT TO SPEECH ENGINE
// =====================================


function speak(
    text
){


    if(
        localStorage.getItem(
            "haldoVoice"
        )
        ===
        "off"
    ){

        return;

    }



    if(
        "speechSynthesis"
        in
        window
    ){


        let speech =
        new SpeechSynthesisUtterance(
            text
        );


        speech.lang =
        getLanguage();



        speech.rate =
        Number(
            localStorage.getItem(
                "haldoSpeed"
            )
        )
        ||
        1;



        window.speechSynthesis.cancel();


        window.speechSynthesis.speak(
            speech
        );


    }


}









// =====================================
// SPRACHE EINSTELLUNG
// =====================================


function getLanguage(){


    return (

        localStorage.getItem(
            "haldoLanguage"
        )

        ||

        "de-DE"

    );


}









// =====================================
// SPRACHEINGABE VORBEREITUNG
// =====================================


function startVoiceInput(){


    const SpeechRecognition =
    window.SpeechRecognition
    ||
    window.webkitSpeechRecognition;



    if(!SpeechRecognition){

        alert(
            "Spracherkennung wird nicht unterstützt."
        );

        return;

    }



    const recognition =
    new SpeechRecognition();



    recognition.lang =
    getLanguage();



    recognition.onresult =
    function(event){


        let text =
        event.results[0][0].transcript;



        const input =
        document.getElementById(
            "userInput"
        );



        if(input){

            input.value =
            text;

        }


    };



    recognition.start();


}
/* =====================================
   HALDO AI OS v9.1
   VOICE + LANGUAGE + SETTINGS
   PART 3
   ===================================== */





// =====================================
// VOICE SYSTEM
// =====================================


const HalDoVoice = {


    enabled:true,

    gender:"neutral",

    language:"de-DE",

    speed:1,



    load(){


        this.enabled =
        localStorage.getItem(
            "haldoVoice"
        )
        !==
        "off";



        this.gender =
        localStorage.getItem(
            "haldoVoiceGender"
        )
        ||
        "neutral";



        this.language =
        localStorage.getItem(
            "haldoLanguage"
        )
        ||
        "de-DE";



        this.speed =
        Number(
            localStorage.getItem(
                "haldoSpeed"
            )
        )
        ||
        1;


    }



};









// =====================================
// VOICE EINSTELLUNGEN SPEICHERN
// =====================================


function saveVoiceSettings(){


    const voice =
    document.getElementById(
        "voiceSetting"
    );


    if(voice){


        localStorage.setItem(

            "haldoVoice",

            voice.value === "Aus"
            ?
            "off"
            :
            "on"

        );


    }



}









// =====================================
// STIMME AUSWAHL
// =====================================


function setVoiceGender(
    gender
){


    HalDoVoice.gender =
    gender;



    localStorage.setItem(

        "haldoVoiceGender",

        gender

    );


}









// =====================================
// GESCHWINDIGKEIT
// =====================================


function setVoiceSpeed(
    value
){


    HalDoVoice.speed =
    value;



    localStorage.setItem(

        "haldoSpeed",

        value

    );


}









// =====================================
// SPRACHEN SYSTEM
// =====================================


const HalDoLanguages = {


    de:"de-DE",

    en:"en-US",

    tr:"tr-TR",

    ku:"ku",

    ezi:"ku"


};








function changeLanguage(
    language
){


    let selected =
    HalDoLanguages[
        language
    ];



    if(!selected)
    return;



    localStorage.setItem(

        "haldoLanguage",

        selected

    );



    HalDoVoice.language =
    selected;



    speak(

        "Sprache geändert"

    );


}









// =====================================
// AI EINSTELLUNGEN LADEN
// =====================================


function loadAISettings(){


    HalDoVoice.load();



    console.log(

        "🤖 AI Einstellungen geladen"

    );


}









// =====================================
// SPEICHER SYSTEM ERWEITERT
// =====================================


const HalDoMemory = {


    save(
        key,
        value
    ){


        localStorage.setItem(

            key,

            JSON.stringify(
                value
            )

        );


    },



    get(
        key
    ){


        let data =
        localStorage.getItem(
            key
        );



        if(!data)
        return null;



        return JSON.parse(
            data
        );


    },



    remove(
        key
    ){


        localStorage.removeItem(
            key
        );


    }


};









// =====================================
// BENUTZER PROFIL BASIS
// =====================================


function saveUserProfile(
    name
){


    HalDoMemory.save(

        "haldoUser",

        {

            name:name,

            created:
            new Date()
            .toISOString()


        }

    );


}









function loadUserProfile(){


    return HalDoMemory.get(

        "haldoUser"

    );


}









// =====================================
// EINSTELLUNGEN STARTEN
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    loadAISettings();


    let profile =
    loadUserProfile();



    if(profile){

        console.log(

            "Willkommen zurück "
            +
            profile.name

        );

    }


}

);
/* =====================================
   HALDO AI OS v9.1
   FILES + PRODUCTIVITY + SETTINGS
   PART 4
   ===================================== */







// =====================================
// DATEIEN SYSTEM
// =====================================


const HalDoFiles = {


    files:[],



    add(file){


        this.files.push(
            file
        );


        this.save();


    },



    remove(index){


        this.files.splice(
            index,
            1
        );


        this.save();


    },



    save(){


        localStorage.setItem(

            "haldoFiles",

            JSON.stringify(
                this.files
            )

        );


    },



    load(){


        let data =
        localStorage.getItem(
            "haldoFiles"
        );


        if(data){

            this.files =
            JSON.parse(
                data
            );

        }


    }


};









// =====================================
// DATEI HOCHLADEN
// =====================================


function uploadFile(){


    const input =
    document.getElementById(
        "fileInput"
    );


    if(
        !input ||
        !input.files.length
    ){

        return;

    }



    let file =
    input.files[0];



    HalDoFiles.add({

        name:file.name,

        size:file.size,

        type:file.type,

        date:
        new Date()
        .toISOString()


    });



    showNotification(
        "Datei gespeichert 📁"
    );


}









// =====================================
// PDF CREATOR BASIS
// =====================================


function createPDF(){


    const text =
    document.getElementById(
        "pdfText"
    );



    if(!text)
    return;



    let content =
    text.value;



    if(
        content.trim()===""
    ){

        showNotification(
            "Kein Text vorhanden"
        );

        return;

    }



    let blob =
    new Blob(

        [
            content
        ],

        {
            type:
            "application/pdf"
        }

    );



    let url =
    URL.createObjectURL(
        blob
    );



    let link =
    document.createElement(
        "a"
    );


    link.href =
    url;


    link.download =
    "HalDo_Dokument.pdf";


    link.click();



    showNotification(
        "PDF erstellt 📄"
    );


}









// =====================================
// SCHREIBEN APP
// =====================================


function saveWriting(){


    let text =
    document.getElementById(
        "writingArea"
    );



    if(!text)
    return;



    localStorage.setItem(

        "haldoWriting",

        text.value

    );



    showNotification(
        "Text gespeichert 📝"
    );


}









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

        text.value =
        saved;

    }


}









// =====================================
// NOTIZEN SYSTEM
// =====================================


function saveNote(note){


    let notes =
    HalDoMemory.get(
        "haldoNotes"
    )
    ||
    [];



    notes.push({

        text:note,

        date:
        new Date()
        .toLocaleString()

    });



    HalDoMemory.save(

        "haldoNotes",

        notes

    );


}









function getNotes(){


    return (

        HalDoMemory.get(
            "haldoNotes"
        )

        ||

        []

    );


}









// =====================================
// DARK MODE
// =====================================


function toggleDarkMode(){


    document.body.classList.toggle(
        "dark-mode"
    );



    let active =
    document.body.classList.contains(
        "dark-mode"
    );



    localStorage.setItem(

        "haldoDarkMode",

        active

    );


}









function loadDarkMode(){


    let mode =
    localStorage.getItem(
        "haldoDarkMode"
    );



    if(mode==="true"){


        document.body.classList.add(
            "dark-mode"
        );


    }


}









// =====================================
// SYSTEM EINSTELLUNGEN
// =====================================


const HalDoSettings = {


    save(
        key,
        value
    ){


        localStorage.setItem(

            "setting_"+key,

            value

        );


    },



    get(
        key
    ){


        return localStorage.getItem(

            "setting_"+key

        );


    }


};









// =====================================
// BENACHRICHTIGUNG
// =====================================


function showNotification(
    text
){


    console.log(
        "🔔",
        text
    );


    let box =
    document.getElementById(
        "notification"
    );



    if(box){


        box.innerHTML =
        text;


        box.style.display =
        "block";



        setTimeout(

            ()=>{

                box.style.display =
                "none";

            },

            3000

        );


    }


}









// =====================================
// SYSTEM LADEN
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoFiles.load();

    loadDarkMode();

    loadWriting();


    console.log(

        "📁 Produktivitätssystem bereit"

    );


}

);
/* =====================================
   HALDO AI OS v9.1
   SYSTEM CENTER + DESKTOP
   PART 5
   ===================================== */







// =====================================
// BENACHRICHTIGUNGSZENTRALE
// =====================================


const HalDoNotifications = {


    list:[],



    add(message,type="info"){


        let notification = {


            message:message,

            type:type,

            time:
            new Date()
            .toLocaleTimeString()


        };



        this.list.push(
            notification
        );


        this.save();


        showNotification(
            message
        );


    },



    save(){


        localStorage.setItem(

            "haldoNotifications",

            JSON.stringify(
                this.list
            )

        );


    },



    load(){


        let data =
        localStorage.getItem(
            "haldoNotifications"
        );



        if(data){

            this.list =
            JSON.parse(
                data
            );

        }


    }


};









// =====================================
// MOBILE ERKENNUNG
// =====================================


const HalDoMobile = {


    isMobile(){


        return (

            window.innerWidth <= 768

        );


    },



    init(){


        if(
            this.isMobile()
        ){

            document.body.classList.add(
                "mobile-device"
            );


            console.log(
                "📱 Mobile Modus aktiv"
            );


        }


    }



};









// =====================================
// DESKTOP SYSTEM
// =====================================


const HalDoDesktop = {


    active:true,



    init(){


        if(
            !HalDoMobile.isMobile()
        ){


            document.body.classList.add(
                "desktop-device"
            );


            console.log(
                "🖥️ Desktop Modus aktiv"
            );


        }


    },



    fullscreen(){


        if(
            document.documentElement.requestFullscreen
        ){

            document.documentElement.requestFullscreen();

        }


    }


};









// =====================================
// FENSTER MANAGER
// =====================================


const HalDoWindowManager = {


    windows:[],



    register(id){


        let windowElement =
        document.getElementById(
            id
        );



        if(windowElement){


            this.windows.push(
                id
            );


        }


    },



    open(id){


        closeWindows();


        openWindow(
            id
        );


    },



    closeAll(){


        closeWindows();


    }


};









// =====================================
// SUCHE SYSTEM
// =====================================


const HalDoSearch = {


    items:[

        "HalDo AI",

        "Einstellungen",

        "Dateien",

        "PDF Creator",

        "Notizen",

        "Kalender"

    ],




    search(text){


        let result =
        this.items.filter(

            item =>

            item
            .toLowerCase()
            .includes(

                text
                .toLowerCase()

            )

        );



        return result;


    }


};









function performSearch(){


    let input =
    document.getElementById(
        "searchInput"
    );



    if(!input)
    return;



    let results =
    HalDoSearch.search(
        input.value
    );



    console.log(
        "🔍 Suche:",
        results
    );


}









// =====================================
// DOCK BASIS
// =====================================


function openDockApp(
    app
){


    openWindow(
        app
    );


}









// =====================================
// SYSTEM START
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoNotifications.load();


    HalDoMobile.init();


    HalDoDesktop.init();



    console.log(

        "🔔 Systemzentrale bereit"

    );


}

);
/* =====================================
   HALDO AI OS v9.1
   MEMORY + LANGUAGE + FUTURE ENGINE
   PART 6
   ===================================== */







// =====================================
// ERWEITERTES AI GEDÄCHTNIS
// =====================================


const HalDoAIMemory = {


    conversations:[],


    preferences:{},


    facts:[],



    saveConversation(message){


        this.conversations.push({

            text:message,

            date:
            new Date()
            .toISOString()

        });


        this.store();


    },



    savePreference(
        key,
        value
    ){


        this.preferences[key]=value;


        this.store();


    },



    rememberFact(
        fact
    ){


        this.facts.push(
            fact
        );


        this.store();


    },



    store(){


        localStorage.setItem(

            "haldoAI_memory",

            JSON.stringify({

                conversations:
                this.conversations,


                preferences:
                this.preferences,


                facts:
                this.facts


            })

        );


    },



    load(){


        let data =
        localStorage.getItem(
            "haldoAI_memory"
        );



        if(data){


            let saved =
            JSON.parse(
                data
            );


            this.conversations =
            saved.conversations
            ||
            [];



            this.preferences =
            saved.preferences
            ||
            {};



            this.facts =
            saved.facts
            ||
            [];


        }


    }


};









// =====================================
// MEHRSPRACHIGKEIT SYSTEM
// =====================================


const HalDoTranslator = {


    current:
    "de-DE",



    languages:{


        deutsch:
        "de-DE",


        english:
        "en-US",


        turkce:
        "tr-TR",


        kurdish:
        "ku",


        ezidi:
        "ku"

    },



    setLanguage(
        language
    ){


        if(
            this.languages[language]
        ){


            this.current =
            this.languages[language];


            localStorage.setItem(

                "haldoLanguage",

                this.current

            );


            speak(
                "Sprache geändert"
            );


        }


    }



};









// =====================================
// SICHERHEIT BASIS
// =====================================


const HalDoSecurity = {


    locked:false,



    enableLock(){


        this.locked =
        true;


        localStorage.setItem(

            "haldoSecurity",

            "locked"

        );


    },



    disableLock(){


        this.locked =
        false;


        localStorage.setItem(

            "haldoSecurity",

            "open"

        );


    },



    status(){


        return this.locked;


    }



};









// =====================================
// ZUKUNFTSMODULE
// =====================================


const HalDoFutureModules = {


    modules:[],



    add(
        name
    ){


        this.modules.push({

            name:name,

            status:
            "ready"


        });


        this.save();


    },



    save(){


        localStorage.setItem(

            "haldoFutureModules",

            JSON.stringify(
                this.modules
            )

        );


    },



    load(){


        let data =
        localStorage.getItem(

            "haldoFutureModules"

        );



        if(data){


            this.modules =
            JSON.parse(
                data
            );


        }


    }


};









// =====================================
// ERWEITERUNGS ENGINE
// =====================================


const HalDoExtensionEngine = {


    extensions:[],



    register(
        extension
    ){


        this.extensions.push(
            extension
        );


        console.log(

            "🧩 Erweiterung registriert:",
            extension

        );


    },



    list(){


        return this.extensions;


    }



};









// =====================================
// SYSTEM LADEN
// =====================================


document.addEventListener(

"DOMContentLoaded",

()=>{


    HalDoAIMemory.load();


    HalDoFutureModules.load();



    console.log(

        "🧠 AI Memory Engine aktiv"

    );


    console.log(

        "🚀 Erweiterungs-System bereit"

    );


}

);


Halil Donma 
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