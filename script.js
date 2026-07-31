function openChat() {

    const home = document.getElementById("home");
    const chatPage = document.getElementById("chatPage");
    const subtitle = document.getElementById("subtitle");

    home.style.display = "none";
    chatPage.style.display = "block";
    subtitle.innerText = "Chat";

}


function goHome() {

    const home = document.getElementById("home");
    const chatPage = document.getElementById("chatPage");
    const subtitle = document.getElementById("subtitle");

    chatPage.style.display = "none";
    home.style.display = "block";
    subtitle.innerText = "Startseite";

}



function sendMessage() {

    const input = document.getElementById("messageInput");
    const chat = document.getElementById("chatBox");

    const text = input.value.trim();

    if (text === "") {
        return;
    }


    const message = document.createElement("div");

    message.className = "message user";
    message.innerText = text;


    chat.appendChild(message);

    input.value = "";

    chat.scrollTop = chat.scrollHeight;

}



window.onload = function() {

    const input = document.getElementById("messageInput");

    if (input) {

        input.addEventListener("keydown", function(event) {

            if (event.key === "Enter") {

                event.preventDefault();

                sendMessage();

            }

        });

    }

};