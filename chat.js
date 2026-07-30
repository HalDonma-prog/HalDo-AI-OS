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
