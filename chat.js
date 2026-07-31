alert("chat.js wird geladen");

document.addEventListener("DOMContentLoaded", () => {
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const clearButton = document.getElementById("clearChat");
    function addMessage(text, type) {
        const message = document.createElement("div");
        message.className = "message " + type;
        message.innerHTML = `
            <div class="bubble">
                ${text}
            </div>
        `;
        chatBox.appendChild(message);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    function sendMessage() {
        const text = userInput.value.trim();
        if(text === "") return;
        addMessage(text, "user");
        userInput.value = "";
        setTimeout(() => {
            addMessage(
                "HalDo AI Testantwort funktioniert.",
                "ai"
            );
        }, 800);
    }
    sendButton.addEventListener(
        "click",
        sendMessage
    );
    userInput.addEventListener(
        "keydown",
        (event) => {
            if(event.key === "Enter" && !event.shiftKey){
                event.preventDefault();
                sendMessage();
            }
        }
    );
    clearButton.addEventListener(
        "click",
        () => {
            chatBox.innerHTML = "";
            addMessage(
                "Neuer Chat gestartet.",
                "ai"
            );
        }
    );
    console.log("HalDo AI Chat geladen");
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