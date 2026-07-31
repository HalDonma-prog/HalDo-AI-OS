let chatSpeicher = [];
let username = "Gast";


function loadData(){

    username = localStorage.getItem("name") || "Gast";

    let data = localStorage.getItem("appsChat");

    if(data){
        chatSpeicher = JSON.parse(data);
    }

    updateWelcome();
}



function saveChat(){

    localStorage.setItem(
        "appsChat",
        JSON.stringify(chatSpeicher)
    );

}



function showPage(page){

    document.getElementById("home").style.display = "none";
    document.getElementById("chatPage").style.display = "none";
    document.getElementById("settingsPage").style.display = "none";

    document.getElementById(page).style.display = "block";

}



function openChat(){

    showPage("chatPage");

    document.getElementById("subtitle").innerText="Chat";

    loadMessages();

}



function openSettings(){

    showPage("settingsPage");

    document.getElementById("subtitle").innerText="Einstellungen";

}



function goHome(){

    showPage("home");

    document.getElementById("subtitle").innerText="Startseite";

    updateWelcome();

}



function sendMessage(){

    let input=document.getElementById("messageInput");

    let text=input.value.trim();


    if(text===""){
        return;
    }


    chatSpeicher.push({

        user:username,
        text:text

    });


    saveChat();

    input.value="";

    loadMessages();

}



function loadMessages(){

    let chat=document.getElementById("chatBox");

    chat.innerHTML="";


    chatSpeicher.forEach(function(item){

        let div=document.createElement("div");

        div.className="message user";

        div.innerText=item.user+": "+item.text;

        chat.appendChild(div);

    });

}



function clearChat(){

    chatSpeicher=[];

    saveChat();

    loadMessages();

}



function saveName(){

    let name=document.getElementById("nameInput").value.trim();


    if(name){

        username=name;

        localStorage.setItem("name",name);

    }


    goHome();

}



function updateWelcome(){

    let title=document.getElementById("welcome");

    if(title){

        title.innerText="Willkommen "+username;

    }

}



window.onload=function(){

    loadData();


    let input=document.getElementById("messageInput");


    if(input){

        input.addEventListener("keydown",function(e){

            if(e.key==="Enter"){

                e.preventDefault();

                sendMessage();

            }

        });

    }

};