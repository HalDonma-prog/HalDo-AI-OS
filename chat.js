const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const clearButton = document.getElementById("clearChat");


let history = JSON.parse(
    localStorage.getItem("haldo_chat")
) || [];


function addMessage(text, type){

    const wrapper = document.createElement("div");

    wrapper.className = `message ${type}`;


    wrapper.innerHTML = `
        <div class="bubble">
            ${text}
        </div>
    `;


    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;

}



function saveChat(){

    localStorage.setItem(
        "haldo_chat",
        JSON.stringify(history)
    );

}



function loadChat(){

    if(history.length){

        chatBox.innerHTML="";

        history.forEach(msg=>{

            addMessage(
                msg.text,
                msg.type
            );

        });

    }

}



async function sendMessage(){

    const text = userInput.value.trim();


    if(!text) return;


    addMessage(text,"user");


    history.push({
        text:text,
        type:"user"
    });


    saveChat();


    userInput.value="";


    const loading=document.createElement("div");

    loading.className="message ai typing";

    loading.innerHTML=
    `<div class="bubble">
        HalDo AI denkt...
    </div>`;


    chatBox.appendChild(loading);


    setTimeout(()=>{

        loading.remove();


        const answer =
        "Das ist aktuell die Testversion von HalDo AI. Die echte KI-Schnittstelle wird als nächster Schritt verbunden.";


        addMessage(answer,"ai");


        history.push({

            text:answer,
            type:"ai"

        });


        saveChat();


    },1200);


}



sendButton.addEventListener(
    "click",
    sendMessage
);



userInput.addEventListener(
    "keydown",
    function(e){

        if(e.key==="Enter" && !e.shiftKey){

            e.preventDefault();

            sendMessage();

        }

    }
);



clearButton.addEventListener(
    "click",
    function(){

        localStorage.removeItem(
            "haldo_chat"
        );

        history=[];

        chatBox.innerHTML="";

        addMessage(
            "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?",
            "ai"
        );

    }
);



loadChat();
HalDo-ai/
│
├── index.html
├── dashboard.html
├── chat.html
│
├── style.css
├── dashboard.css
├── chat.css
│
├── script.js
├── dashboard.js
├── chat.js
│
├── README.md
├── 227E9D20-F8F7-44E9-B194-1F76378888B7.PNG
│
└── images/