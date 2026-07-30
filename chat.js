// HalDo AI Chat Version 1.0


const input = document.getElementById("userInput");
const button = document.getElementById("sendButton");
const messages = document.getElementById("messages");



function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add("message");

    if (type === "user") {

        message.classList.add("user");

    } else {

        message.classList.add("ai");

    }


    message.innerText = text;


    messages.appendChild(message);


    messages.scrollTop = messages.scrollHeight;

}




function sendMessage() {


    const text = input.value.trim();


    if (text === "") {

        return;

    }



    // Nutzer Nachricht

    addMessage(text, "user");



    input.value = "";



    // HalDo AI Test Antwort

    setTimeout(function(){


        addMessage(
            "🤖 Ich habe deine Nachricht erhalten. HalDo AI entwickelt sich weiter.",
            "ai"
        );


    },700);



}



button.addEventListener(
    "click",
    sendMessage
);



input.addEventListener(
    "keypress",
    function(event){

        if(event.key === "Enter"){

            sendMessage();

        }

    }
);
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