function sendMessage() {

    let input = document.getElementById("messageInput");
    let chat = document.getElementById("chatBox");

    let text = input.value;

    if (text === "") {
        return;
    }

    let message = document.createElement("p");
    message.textContent = "Du: " + text;

    chat.appendChild(message);

    input.value = "";

}