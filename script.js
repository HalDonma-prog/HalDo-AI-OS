function sendMessage() {

    let input = document.getElementById("messageInput");
    let chat = document.getElementById("chatBox");

    let text = input.value.trim();

    if (text === "") {
        return;
    }

    let message = document.createElement("div");
    message.className = "message user";
    message.textContent = text;

    chat.appendChild(message);

    input.value = "";

    chat.scrollTop = chat.scrollHeight;
}


document.getElementById("messageInput")
.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});