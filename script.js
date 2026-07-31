function openChat() {

    document.getElementById("home").classList.add("hidden");

    document.getElementById("chatPage")
    .classList.remove("hidden");

    document.getElementById("subtitle")
    .innerText = "Chat";

}



function goHome() {

    document.getElementById("chatPage")
    .classList.add("hidden");


    document.getElementById("home")
    .classList.remove("hidden");


    document.getElementById("subtitle")
    .innerText = "Startseite";

}



function sendMessage() {


    let input = document.getElementById("messageInput");

    let chat = document.getElementById("chatBox");


    let text = input.value.trim();


    if(text === "") {

        return;

    }


    let message = document.createElement("div");


    message.className = "message user";


    message.innerText = text;


    chat.appendChild(message);


    input.value = "";


    chat.scrollTop = chat.scrollHeight;

}



window.onload = function(){

    let input = document.getElementById("messageInput");


    input.addEventListener("keypress", function(event){

        if(event.key === "Enter"){

            event.preventDefault();

            sendMessage();

        }

    });

};