alert("HalDo Chat JS geladen");

const sendButton = document.getElementById("sendButton");
const userInput = document.getElementById("userInput");
const messages = document.getElementById("messages");


sendButton.addEventListener("click", sendMessage);


userInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {

        sendMessage();

    }

});


function sendMessage() {

    const text = userInput.value.trim();


    if (text === "") {

        return;

    }


    // Nutzer Nachricht

    const userMessage = document.createElement("div");

    userMessage.className = "message user";

    userMessage.textContent = text;


    messages.appendChild(userMessage);


    userInput.value = "";


    // Test-Antwort von HalDo AI

    setTimeout(function() {

        const aiMessage = document.createElement("div");

        aiMessage.className = "message ai";

        aiMessage.textContent =
        "🤖 HalDo AI: Ich habe deine Nachricht erhalten. Die echte KI-Verbindung folgt.";

        messages.appendChild(aiMessage);


    }, 700);


}

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