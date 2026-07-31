let chatSpeicher = [];


function openChat(){

    document.getElementById("home").style.display="none";
    document.getElementById("chatPage").style.display="block";
    document.getElementById("subtitle").innerText="Chat";

    loadMessages();

}



function goHome(){

    document.getElementById("chatPage").style.display="none";
    document.getElementById("home").style.display="block";
    document.getElementById("subtitle").innerText="Startseite";

}



function saveMessages(){

    try {

        localStorage.setItem(
            "appsWebChat",
            JSON.stringify(chatSpeicher)
        );

    } catch(e) {

        console.log("Speichern nicht möglich");

    }

}



function loadStorage(){

    try {

        let data = localStorage.getItem("appsWebChat");

        if(data){

            chatSpeicher = JSON.parse(data);

        }

    } catch(e){

        chatSpeicher = [];

    }

}



function sendMessage(){

    let input=document.getElementById("messageInput");

    let text=input.value.trim();


    if(text===""){
        return;
    }


    chatSpeicher.push({

        user:"Du",
        text:text

    });


    saveMessages();


    input.value="";

    loadMessages();

}



function loadMessages(){

    let chat=document.getElementById("chatBox");

    chat.innerHTML="";


    if(chatSpeicher.length===0){

        chat.innerHTML=
        '<div class="message bot">Willkommen im Chat 👋</div>';

        return;

    }


    chatSpeicher.forEach(function(item){

        let div=document.createElement("div");

        div.className="message user";

        div.innerText=item.user+": "+item.text;

        chat.appendChild(div);

    });


    chat.scrollTop=chat.scrollHeight;

}



window.onload=function(){

    loadStorage();


    let input=document.getElementById("messageInput");


    if(input){

        input.addEventListener("keydown",function(event){

            if(event.key==="Enter"){

                event.preventDefault();

                sendMessage();

            }

        });

    }

};