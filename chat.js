alert("HalDo chat.js läuft");
alert("CHAT.JS WIRD GELADEN");

window.onload = function () {

    const button = document.getElementById("sendButton");
    const input = document.getElementById("userInput");
    const box = document.getElementById("chatBox");


    alert("ELEMENTE GEFUNDEN");


    button.onclick = function () {

        alert("BUTTON FUNKTIONIERT");


        const text = input.value;


        if(text.trim() === "") {
            return;
        }


        box.innerHTML += `
            <div class="message user">
                <div class="bubble">
                    ${text}
                </div>
            </div>
        `;


        input.value = "";

    };

};

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