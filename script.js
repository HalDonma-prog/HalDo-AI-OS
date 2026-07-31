let aktuellerBenutzer = "";

let benutzerListe = [];

let chatSpeicher = [];




// Daten laden

function loadData(){

    aktuellerBenutzer =
    localStorage.getItem("aktuellerBenutzer") || "";


    let users =
    localStorage.getItem("benutzerListe");


    if(users){

        benutzerListe = JSON.parse(users);

    }


    let chat =
    localStorage.getItem("appsChat");


    if(chat){

        chatSpeicher = JSON.parse(chat);

    }


    if(aktuellerBenutzer){

        showPage("home");

        updateUser();

    }


}




// Seiten wechseln

function showPage(page){

    document.getElementById("loginPage").style.display="none";

    document.getElementById("home").style.display="none";

    document.getElementById("chatPage").style.display="none";

    document.getElementById("usersPage").style.display="none";


    document.getElementById(page).style.display="block";

}




// Login

function login(){

    let name =
    document.getElementById("loginName").value.trim();


    let password =
    document.getElementById("loginPassword").value.trim();



    if(name==="" || password===""){

        alert("Bitte Name und Passwort eingeben");

        return;

    }



    aktuellerBenutzer=name;


    if(!benutzerListe.includes(name)){

        benutzerListe.push(name);

    }


    localStorage.setItem(
    "aktuellerBenutzer",
    name
    );


    localStorage.setItem(
    "benutzerListe",
    JSON.stringify(benutzerListe)
    );


    showPage("home");

    updateUser();

}




// Benutzer anzeigen

function updateUser(){

    document.getElementById("activeUser")
    .innerText=aktuellerBenutzer;


    document.getElementById("welcome")
    .innerText="Willkommen "+aktuellerBenutzer;

}




// Logout

function logout(){

    aktuellerBenutzer="";


    localStorage.removeItem(
    "aktuellerBenutzer"
    );


    showPage("loginPage");

}





// Home

function goHome(){

    showPage("home");

}




// Chat öffnen

function openChat(){

    showPage("chatPage");

    loadMessages();

}




// Nachricht senden

function sendMessage(){

    let input =
    document.getElementById("messageInput");


    let text =
    input.value.trim();



    if(text===""){

        return;

    }



    chatSpeicher.push({

        user:aktuellerBenutzer,

        text:text

    });



    botAntwort(text);



    saveChat();


    input.value="";


    loadMessages();

}




// einfache KI Antwort

function botAntwort(text){


    let antwort="Ich habe deine Nachricht gespeichert. 🙂";


    text=text.toLowerCase();



    if(text.includes("hallo")){

        antwort="Hallo "+aktuellerBenutzer+" 👋";

    }


    if(text.includes("wie geht")){

        antwort="Mir geht es gut. Ich bin bereit zu helfen. 🤖";

    }


    if(text.includes("name")){

        antwort="Du bist angemeldet als "+aktuellerBenutzer+".";

    }



    chatSpeicher.push({

        user:"Apps Web KI",

        text:antwort

    });


}





function loadMessages(){

    let box =
    document.getElementById("chatBox");


    box.innerHTML="";



    chatSpeicher.forEach(function(item){


        let div =
        document.createElement("div");


        div.className="message";



        if(item.user==="Apps Web KI"){

            div.className="message bot";

        }

        else{

            div.className="message user";

        }



        div.innerText =
        item.user+": "+item.text;


        box.appendChild(div);



    });



}




function saveChat(){

    localStorage.setItem(

    "appsChat",

    JSON.stringify(chatSpeicher)

    );

}




// Benutzerverwaltung

function openUsers(){

    showPage("usersPage");

    displayUsers();

}




function addUser(){

    let input =
    document.getElementById("newUser");


    let name =
    input.value.trim();



    if(name===""){

        return;

    }



    if(!benutzerListe.includes(name)){

        benutzerListe.push(name);

    }



    localStorage.setItem(

    "benutzerListe",

    JSON.stringify(benutzerListe)

    );



    input.value="";


    displayUsers();

}




function displayUsers(){

    let box =
    document.getElementById("usersList");


    box.innerHTML="";



    benutzerListe.forEach(function(user){


        let div =
        document.createElement("div");


        div.className="user-card";


        div.innerText=user;


        box.appendChild(div);


    });


}




window.onload=function(){

    loadData();


    let input =
    document.getElementById("messageInput");


    if(input){

        input.addEventListener(
        "keydown",
        function(e){


            if(e.key==="Enter"){

                e.preventDefault();

                sendMessage();

            }


        });

    }



    if("serviceWorker" in navigator){

        navigator.serviceWorker.register(
        "service-worker.js"
        );

    }


};