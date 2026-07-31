// ==================================
// HalDo AI Chat - Version 1.0
// ==================================

document.addEventListener("DOMContentLoaded", () => {
    alert("chat.js wurde geladen");
    const sendButton = document.getElementById("sendButton");
    const userInput = document.getElementById("userInput");
    const messages = document.getElementById("messages");

    function sendMessage() {

        const text = userInput.value.trim();

        if (text === "") return;

        // Nachricht des Benutzers anzeigen
        const userMessage = document.createElement("div");
        userMessage.className = "message user";
        userMessage.textContent = text;

        messages.appendChild(userMessage);

        userInput.value = "";

        // Automatische Antwort
        setTimeout(() => {

            const aiMessage = document.createElement("div");
            aiMessage.className = "message ai";

            aiMessage.textContent =
                "🤖 Danke für deine Nachricht! Dies ist die erste Version von HalDo AI. Bald wirst du hier echte KI-Antworten erhalten.";

            messages.appendChild(aiMessage);

            // Automatisch nach unten scrollen
            messages.scrollTop = messages.scrollHeight;

        }, 700);

    }

sendButton.addEventListener("click", () => {

    alert("Button funktioniert");

    sendMessage();

});

    userInput.addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            sendMessage();

        }

    });

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