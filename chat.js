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
│
├── style.css
├── dashboard.css
├── chat.css
│
├── script.js
├── dashboard.js
├── chat.js
│
├── README.md
├── 227E9D20-F8F7-44E9-B194-1F76378888B7.PNG
│
└── images/