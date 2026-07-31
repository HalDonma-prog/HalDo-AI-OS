alert("HalDo chat.js läuft");
document.addEventListener("DOMContentLoaded", () => {
    const chatWindow = document.getElementById("chatWindow");
    const messageInput = document.getElementById("messageInput");
    const sendButton = document.getElementById("sendButton");
    const newChatButton = document.getElementById("newChat");
    let messages = JSON.parse(
        localStorage.getItem("haldo_messages")
    ) || [];
    function createMessage(text, type) {
        const message = document.createElement("div");
        message.className = "message " + type;
        if(type === "ai") {
            message.innerHTML = `
                <div class="avatar">
                    🤖
                </div>
                <div class="bubble">
                    ${text}
                </div>
            `;
        } else {
            message.innerHTML = `
                <div class="bubble">
                    ${text}
                </div>
            `;
        }
        chatWindow.appendChild(message);
        chatWindow.scrollTop =
            chatWindow.scrollHeight;
    }
    function saveMessages() {
        localStorage.setItem(
            "haldo_messages",
            JSON.stringify(messages)
        );
    }
    function sendMessage() {
        const text =
            messageInput.value.trim();
        if(text === "") {
            return;
        }
        createMessage(
            text,
            "user"
        );
        messages.push({
            text:text,
            type:"user"
        });
        saveMessages();
        messageInput.value = "";
        showAIResponse();
    }
    function showAIResponse() {
        const typing =
            document.createElement("div");
        typing.className =
            "message ai";
        typing.innerHTML = `
            <div class="avatar">
                🤖
            </div>
            <div class="bubble">
                HalDo AI denkt...
            </div>
        `;
        chatWindow.appendChild(typing);
        setTimeout(() => {
            typing.remove();
            const answer =
                "Hallo! Dies ist die HalDo AI Version 2 Testantwort. Die echte KI-Verbindung kommt als nächster Schritt.";
            createMessage(
                answer,
                "ai"
            );
            messages.push({
                text:answer,
                type:"ai"
            });
            saveMessages();
        },1000);
    }
    function loadMessages() {
        if(messages.length === 0) {
            return;
        }
        chatWindow.innerHTML = "";
        messages.forEach(item => {
            createMessage(
                item.text,
                item.type
            );
        });
    }
    sendButton.addEventListener(
        "click",
        sendMessage
    );
    messageInput.addEventListener(
        "keydown",
        (event)=>{
            if(event.key === "Enter"
               && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }
    );
    newChatButton.addEventListener(
        "click",
        ()=>{
            localStorage.removeItem(
                "haldo_messages"
            );
            messages = [];
            chatWindow.innerHTML = "";
            createMessage(
                "Hallo! Ich bin HalDo AI. Wie kann ich dir helfen?",
                "ai"
            );
        }
    );
    loadMessages();
});

HalDo-ai/
│
├── index.html
├── dashboard.html
├── chat.html
├── tools.html
├── profile.html
├── settings.html
│
├── style.css
├── dashboard.css
├── chat.css
├── tools.css
├── profile.css
├── settings.css
│
├── script.js
├── dashboard.js
├── chat.js
├── tools.js
├── profile.js
├── settings.js
│
├── images/
└── README.md
