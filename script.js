function sendMessage() {

    const input = document.getElementById("messageInput");
    const chat = document.getElementById("chatBox");

    if (!input || !chat) {
        return;
    }

    const text = input.value.trim();

    if (text.length === 0) {
        return;
    }

    const message = document.createElement("div");

    message.className = "message user";
    message.innerText = text;

    chat.appendChild(message);

    input.value = "";

    setTimeout(function() {
        chat.scrollTop = chat.scrollHeight;
    }, 100);
}


// iPhone Tastatur-Unterstützung
window.onload = function() {

    const input = document.getElementById("messageInput");

    if (input) {

        input.addEventListener("keypress", function(event) {

            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }

        });

    }

};