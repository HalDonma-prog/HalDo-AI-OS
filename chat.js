// HalDo AI - Chat Funktion

const input = document.getElementById("chat-input");
const sendButton = document.getElementById("send-button");
const messages = document.getElementById("chat-messages");


// Nachricht hinzufügen

function addMessage(text, type) {

    const message = document.createElement("div");

    message.classList.add("message");

    if (type === "user") {
        message.classList.add("user-message");
    } else {
        message.classList.add("ai-message");
    }

    message.innerText = text;

    messages.appendChild(message);

    // automatisch nach unten scrollen
    messages.scrollTop = messages.scrollHeight;
}


// Nachricht senden

function sendMessage() {

    const text = input.value.trim();

    if (text === "") {
        return;
    }


    // User Nachricht
    addMessage(text, "user");


    // Eingabe leeren
    input.value = "";


    // KI Testantwort
    setTimeout(() => {

        addMessage(
            "Hallo! Ich bin HalDo AI 🤖. Deine Nachricht wurde empfangen.",
            "ai"
        );

    }, 700);

}


// Button Klick

sendButton.addEventListener("click", sendMessage);


// Enter Taste

input.addEventListener("keypress", function(event){

    if(event.key === "Enter"){
        sendMessage();
    }

});
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