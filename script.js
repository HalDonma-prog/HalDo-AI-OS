/* =====================================
   HALDO AI OS 10.0
   SCRIPT SYSTEM
   PART 1/8
===================================== */


/* =====================================
   HALDO CORE
===================================== */


const HalDo = {

    version: "10.0",

    name: "HalDo AI OS",

    ready: false,

    memory: {},


    start(){

        console.log(
            "🚀 HalDo AI OS gestartet"
        );


        this.loadMemory();

        this.connectNavigation();

        this.connectWindows();

        this.ready = true;

        this.showSystemReady();

    }

};









/* =====================================
   SYSTEM START
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{

    HalDo.start();

});









/* =====================================
   NAVIGATION SYSTEM
===================================== */


HalDo.connectNavigation = function(){


    const menuButton =
    document.querySelector(
        ".menu-button"
    );


    const menu =
    document.querySelector(
        "#mainMenu"
    );


    if(menuButton && menu){

        menuButton.onclick = ()=>{

            menu.classList.toggle(
                "active"
            );

        };

    }

};









/* =====================================
   WINDOW SYSTEM
===================================== */


HalDo.connectWindows = function(){


    const buttons =
    document.querySelectorAll(
        "[data-window]"
    );


    buttons.forEach(
    button=>{

        button.addEventListener(
        "click",
        ()=>{

            openWindow(
                button.dataset.window
            );

        });

    });


};









function openWindow(id){


    document
    .querySelectorAll(
        ".app-window"
    )
    .forEach(
    window=>{

        window.classList.remove(
            "active"
        );

    });


    const target =
    document.getElementById(
        id
    );


    if(target){

        target.classList.add(
            "active"
        );

    }

}









function closeWindow(){


    document
    .querySelectorAll(
        ".app-window"
    )
    .forEach(
    window=>{

        window.classList.remove(
            "active"
        );

    });

}





document
.querySelectorAll(
".close-window"
)
.forEach(
button=>{

    button.onclick =
    closeWindow;

});









/* =====================================
   MEMORY BASIS
===================================== */


HalDo.loadMemory = function(){


    const data =
    localStorage.getItem(
        "haldoMemory"
    );


    if(data){

        this.memory =
        JSON.parse(
            data
        );

    }
    else{

        this.memory = {};

    }

};









HalDo.saveMemory = function(){


    localStorage.setItem(

        "haldoMemory",

        JSON.stringify(
            this.memory
        )

    );

};









/* =====================================
   SYSTEM READY
===================================== */


HalDo.showSystemReady = function(){


    console.log(
        "✅ HalDo AI OS 10.0 bereit"
    );


};
/* =====================================
   HALDO AI OS 10.0
   CHAT + VOICE SYSTEM
   PART 2/8
===================================== */


/* =====================================
   CHAT SYSTEM
===================================== */


const HalDoChat = {


    send(message){


        if(!message) return;


        this.addMessage(
            "user",
            message
        );


        const answer =
        this.createAnswer(
            message
        );


        setTimeout(()=>{


            this.addMessage(
                "ai",
                answer
            );


            HalDoVoice.speak(
                answer
            );


        },500);


    },









    addMessage(type,text){


        const container =
        document.querySelector(
            ".chat-container"
        );


        if(!container) return;



        const message =
        document.createElement(
            "div"
        );


        message.className =
        type === "ai"
        ?
        "ai-message"
        :
        "user-message";



        message.innerHTML = `

            <div class="chat-bubble">

            ${text}

            </div>

        `;



        container.appendChild(
            message
        );



        container.scrollTop =
        container.scrollHeight;


    },









    createAnswer(message){


        let text =
        message.toLowerCase();



        if(
            text.includes(
                "hallo"
            )
        ){

            return "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?";

        }



        if(
            text.includes(
                "name"
            )
        ){

            return "Ich bin HalDo AI OS Version 10.0.";

        }



        if(
            text.includes(
                "hilfe"
            )
        ){

            return "Ich kann dich bei Navigation, Dateien, Schreiben und Systemfunktionen unterstützen.";

        }



        return "Ich habe deine Nachricht erhalten. Meine AI Engine wird weiter erweitert.";

    }


};









/* =====================================
   CHAT INPUT CONNECTION
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    const button =
    document.querySelector(
        "#sendMessage"
    );


    const input =
    document.querySelector(
        "#chatInput"
    );



    if(button && input){


        button.onclick = ()=>{


            HalDoChat.send(
                input.value
            );


            input.value="";


        };


    }


});









/* =====================================
   VOICE SYSTEM BASIS
===================================== */


const HalDoVoice = {


    enabled:true,


    speak(text){


        if(
            !this.enabled
        ) return;



        if(
            "speechSynthesis"
            in window
        ){


            const speech =
            new SpeechSynthesisUtterance(
                text
            );


            speech.lang =
            "de-DE";


            speech.rate =
            1;



            window
            .speechSynthesis
            .speak(
                speech
            );


        }


    }


};









/* =====================================
   VOICE BUTTON PREPARATION
===================================== */


function startVoiceInput(){


    const SpeechRecognition =
    window.SpeechRecognition ||
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
    "de-DE";



    recognition.onresult =
    function(event){


        const text =
        event.results[0][0].transcript;



        HalDoChat.send(
            text
        );


    };



    recognition.start();


}
/* =====================================
   HALDO AI OS 10.0
   VOICE + LANGUAGE + SETTINGS
   PART 3/8
===================================== */


/* =====================================
   ADVANCED VOICE SYSTEM
===================================== */


const HalDoVoiceControl = {


    recognition:null,


    active:false,


    init(){


        const Recognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;



        if(!Recognition){

            console.log(
                "🎤 Sprache nicht verfügbar"
            );

            return;

        }



        this.recognition =
        new Recognition();



        this.recognition.lang =
        HalDoSettings.language;



        this.recognition.continuous =
        false;



        this.recognition.onstart =
        ()=>{

            this.active = true;

            console.log(
                "🎤 Sprachaufnahme gestartet"
            );

        };



        this.recognition.onend =
        ()=>{

            this.active = false;

        };



        this.recognition.onresult =
        (event)=>{


            const text =
            event
            .results[0][0]
            .transcript;



            HalDoChat.send(
                text
            );


        };


    },









    start(){


        if(
            this.recognition
        ){

            this.recognition.start();

        }


    },


    stop(){


        if(
            this.recognition
        ){

            this.recognition.stop();

        }


    }


};









/* =====================================
   VOICE SELECTION BASIS
===================================== */


const HalDoVoiceSettings = {


    voice:null,


    rate:1,


    pitch:1,



    loadVoices(){


        const voices =
        speechSynthesis
        .getVoices();



        if(
            voices.length
        ){

            this.voice =
            voices[0];

        }


    },









    apply(text){


        const speech =
        new SpeechSynthesisUtterance(
            text
        );


        speech.voice =
        this.voice;



        speech.rate =
        this.rate;



        speech.pitch =
        this.pitch;



        speech.lang =
        HalDoSettings.language;



        speechSynthesis.speak(
            speech
        );


    }


};



speechSynthesis.onvoiceschanged =
()=>{

    HalDoVoiceSettings
    .loadVoices();

};









/* =====================================
   LANGUAGE SYSTEM
===================================== */


const HalDoLanguage = {


    current:"de-DE",



    change(language){


        this.current =
        language;



        HalDoSettings.language =
        language;



        HalDo.saveSettings();


        console.log(
            "🌍 Sprache geändert:",
            language
        );


    }


};









/* =====================================
   SETTINGS SYSTEM
===================================== */


const HalDoSettings = {


    language:"de-DE",


    theme:"default",


    voice:true,


    load(){


        const saved =
        localStorage.getItem(
            "haldoSettings"
        );



        if(saved){


            Object.assign(

                this,

                JSON.parse(
                    saved
                )

            );


        }


    },









    save(){


        localStorage.setItem(

            "haldoSettings",

            JSON.stringify(
                this
            )

        );


    }


};









HalDoSettings.saveSettings =
HalDoSettings.save;









/* =====================================
   MEMORY EXTENSION
===================================== */


HalDoMemory = {


    add(key,value){


        HalDo.memory[key] =
        value;


        HalDo.saveMemory();


    },









    get(key){


        return HalDo.memory[key];


    },









    remove(key){


        delete HalDo.memory[key];


        HalDo.saveMemory();


    }


};









/* =====================================
   SYSTEM CONNECTION
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    HalDoSettings.load();


    HalDoVoiceControl.init();


});
/* =====================================
   HALDO AI OS 10.0
   FILES + APPS + SYSTEM
   PART 4/8
===================================== */


/* =====================================
   FILE SYSTEM
===================================== */


const HalDoFiles = {


    files:[],



    init(){


        const upload =
        document.querySelector(
            "#fileUpload"
        );


        if(upload){


            upload.addEventListener(
            "change",
            (event)=>{


                this.addFiles(
                    event.target.files
                );


            });


        }


    },









    addFiles(files){


        for(
            let file of files
        ){

            this.files.push({

                name:file.name,

                size:file.size,

                type:file.type

            });

        }


        this.render();


    },









    render(){


        const list =
        document.querySelector(
            "#fileList"
        );



        if(!list) return;



        list.innerHTML="";



        this.files.forEach(
        file=>{


            const item =
            document.createElement(
                "p"
            );


            item.innerHTML =
            "📄 "
            + file.name;



            list.appendChild(
                item
            );


        });


    }


};









/* =====================================
   PDF CREATOR BASIS
===================================== */


const HalDoPDF = {


    create(){


        const title =
        document.querySelector(
            "#pdfTitle"
        )?.value;



        const text =
        document.querySelector(
            "#pdfText"
        )?.value;



        if(!text){

            alert(
                "Bitte Inhalt eingeben"
            );

            return;

        }



        const content =

        title
        +
        "\n\n"
        +
        text;



        const blob =
        new Blob(
            [content],
            {
                type:
                "text/plain"
            }
        );



        const link =
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


    }


};









document.addEventListener(
"DOMContentLoaded",
()=>{


    const pdfButton =
    document.querySelector(
        "#createPDF"
    );



    if(pdfButton){


        pdfButton.onclick =
        ()=>{

            HalDoPDF.create();

        };


    }


});









/* =====================================
   WRITING APP
===================================== */


const HalDoWriter = {


    save(){


        const text =
        document.querySelector(
            "#writerText"
        )?.value;



        localStorage.setItem(

            "haldoDocument",

            text || ""

        );


        alert(
            "📝 Dokument gespeichert"
        );


    }


};









document.addEventListener(
"DOMContentLoaded",
()=>{


    const save =
    document.querySelector(
        "#saveDocument"
    );



    if(save){


        save.onclick =
        ()=>{

            HalDoWriter.save();

        };


    }


});









/* =====================================
   NOTES SYSTEM
===================================== */


const HalDoNotes = {


    notes:[],



    add(){


        const input =
        document.querySelector(
            "#noteInput"
        );



        if(!input || !input.value)
        return;



        this.notes.push(
            input.value
        );


        input.value="";


        this.save();


        this.render();


    },









    save(){


        localStorage.setItem(

            "haldoNotes",

            JSON.stringify(
                this.notes
            )

        );


    },









    render(){


        const list =
        document.querySelector(
            "#noteList"
        );


        if(!list)return;



        list.innerHTML="";



        this.notes.forEach(
        note=>{


            list.innerHTML +=

            `<p>📒 ${note}</p>`;

        });


    }


};









/* =====================================
   DARK MODE
===================================== */


function toggleDarkMode(){


    document.body
    .classList
    .toggle(
        "dark-mode"
    );


    localStorage.setItem(

        "haldoDark",

        document.body
        .classList
        .contains(
            "dark-mode"
        )

    );


}









/* =====================================
   SYSTEM SETTINGS
===================================== */


const HalDoSystem = {


    getStatus(){


        return {

            version:
            HalDo.version,


            ready:
            HalDo.ready,


            memory:
            Object.keys(
                HalDo.memory
            ).length


        };


    }


};









document.addEventListener(
"DOMContentLoaded",
()=>{


    HalDoFiles.init();


});
/* =====================================
   HALDO AI OS 10.0
   SYSTEM CONTROL + SEARCH
   PART 5/8
===================================== */


/* =====================================
   NOTIFICATION CENTER
===================================== */


const HalDoNotification = {


    list:[],


    add(message){


        this.list.push({

            text:message,

            time:
            new Date()
            .toLocaleTimeString()

        });


        this.render();


    },









    render(){


        const box =
        document.querySelector(
            "#notificationList"
        );



        if(!box)return;



        box.innerHTML="";



        this.list
        .slice()
        .reverse()
        .forEach(
        note=>{


            box.innerHTML += `

            <div class="notification-item">

            🔔 ${note.text}

            <small>
            ${note.time}
            </small>

            </div>

            `;


        });


    },









    clear(){


        this.list=[];


        this.render();


    }


};









/* =====================================
   GLOBAL NOTIFICATION
===================================== */


function showNotification(text){


    HalDoNotification.add(
        text
    );


}









/* =====================================
   WINDOW MANAGER
===================================== */


const HalDoWindow = {


    current:null,



    open(id){


        const windows =
        document.querySelectorAll(
            ".app-window"
        );



        windows.forEach(
        win=>{

            win.classList.remove(
                "active"
            );

        });



        const target =
        document.getElementById(
            id
        );



        if(target){


            target.classList.add(
                "active"
            );


            this.current =
            id;


        }


    },









    close(){


        document
        .querySelectorAll(
            ".app-window"
        )
        .forEach(
        win=>{

            win.classList.remove(
                "active"
            );

        });



        this.current=null;


    }


};









/* =====================================
   DESKTOP SYSTEM
===================================== */


const HalDoDesktop = {


    init(){


        const icons =
        document.querySelectorAll(
            ".desktop-icon"
        );



        icons.forEach(
        icon=>{


            icon.addEventListener(
            "dblclick",
            ()=>{


                const app =
                icon.dataset.window;



                if(app){

                    HalDoWindow.open(
                        app
                    );

                }


            });


        });


    }


};









/* =====================================
   MOBILE SYSTEM
===================================== */


const HalDoMobile = {


    check(){


        return window.innerWidth <= 768;


    },









    init(){


        if(
            this.check()
        ){


            document.body
            .classList
            .add(
                "mobile-mode"
            );


        }


    }


};









window.addEventListener(
"resize",
()=>{


    HalDoMobile.init();


});









/* =====================================
   SEARCH SYSTEM
===================================== */


const HalDoSearch = {


    apps:[

        {
            name:"Dateien",
            id:"filesWindow"
        },

        {
            name:"PDF Creator",
            id:"pdfWindow"
        },

        {
            name:"Schreiben",
            id:"writingWindow"
        },

        {
            name:"Notizen",
            id:"notesWindow"
        },

        {
            name:"Kalender",
            id:"calendarWindow"
        }

    ],







    search(text){


        const result =
        document.querySelector(
            "#searchResults"
        );



        if(!result)return;



        result.innerHTML="";



        this.apps
        .filter(
        app=>

        app.name
        .toLowerCase()
        .includes(
            text.toLowerCase()
        )

        )
        .forEach(
        app=>{


            result.innerHTML += `

            <div class="search-result-item"
            onclick="HalDoWindow.open('${app.id}')">

            🔎 ${app.name}

            </div>

            `;


        });


    }


};









/* =====================================
   SEARCH CONNECTION
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    HalDoDesktop.init();


    HalDoMobile.init();



    const input =
    document.querySelector(
        "#searchInput"
    );



    if(input){


        input.addEventListener(
        "input",
        ()=>{


            HalDoSearch.search(
                input.value
            );


        });


    }


});
/* =====================================
   HALDO AI OS 10.0
   MEMORY + SECURITY + EXTENSIONS
   PART 6/8
===================================== */


/* =====================================
   ADVANCED AI MEMORY
===================================== */


const HalDoMemorySystem = {


    data:{},


    load(){


        const saved =
        localStorage.getItem(
            "haldoAIData"
        );



        if(saved){


            this.data =
            JSON.parse(
                saved
            );


        }


    },









    save(){


        localStorage.setItem(

            "haldoAIData",

            JSON.stringify(
                this.data
            )

        );


    },









    remember(key,value){


        this.data[key] =
        value;



        this.save();



        HalDoNotification.add(
            "🧠 Erinnerung gespeichert"
        );


    },









    recall(key){


        return this.data[key];


    },









    clear(){


        this.data={};


        this.save();


    }


};









/* =====================================
   LANGUAGE INTERFACE
===================================== */


const HalDoTranslator = {


    language:"de",



    texts:{


        de:{


            welcome:
            "Willkommen bei HalDo AI",


            ready:
            "System bereit"


        },


        en:{


            welcome:
            "Welcome to HalDo AI",


            ready:
            "System ready"


        },


        fr:{


            welcome:
            "Bienvenue dans HalDo AI",


            ready:
            "Système prêt"


        }


    },









    setLanguage(lang){


        if(
            this.texts[lang]
        ){


            this.language =
            lang;



            HalDoSettings.language =
            lang;



            HalDoSettings.save();


        }


    },









    get(key){


        return (

            this.texts
            [this.language]
            [key]

        )
        ||
        key;


    }


};









/* =====================================
   SECURITY SYSTEM BASIS
===================================== */


const HalDoSecurity = {


    locked:false,



    status:"safe",



    check(){


        console.log(

            "🔐 Sicherheit geprüft"

        );


        this.status =
        "safe";


        return true;


    },









    lock(){


        this.locked=true;


        HalDoNotification.add(

            "🔒 System gesperrt"

        );


    },









    unlock(){


        this.locked=false;


        HalDoNotification.add(

            "🔓 System entsperrt"

        );


    }


};









/* =====================================
   FUTURE MODULE SYSTEM
===================================== */


const HalDoFuture = {


    modules:[],



    register(name,func){


        this.modules.push({

            name:name,

            function:func

        });


        console.log(

            "🧩 Modul registriert:",
            name

        );


    },









    start(name){


        const module =
        this.modules.find(

            item=>

            item.name===name

        );



        if(module){


            module.function();


        }


    }


};









/* =====================================
   EXTENSION ENGINE
===================================== */


const HalDoExtension = {


    plugins:[],



    add(plugin){


        this.plugins.push(
            plugin
        );


        console.log(

            "🚀 Erweiterung geladen:",
            plugin

        );


    },









    list(){


        return this.plugins;


    }


};









/* =====================================
   SYSTEM CONNECTION
===================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


    HalDoMemorySystem.load();


    HalDoSecurity.check();



    HalDoFuture.register(

        "AI Future Core",

        ()=>{

            console.log(
                "🌌 Future Core aktiv"
            );

        }

    );


});