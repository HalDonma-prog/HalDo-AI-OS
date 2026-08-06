// =====================================
// HalDo AI Chat System
// =====================================



function sendMessage(){



const input = document.getElementById(

"message"

);



const text = input.value.trim();



if(text === ""){

return;

}



const box = document.getElementById(

"chat-box"

);



const user = document.createElement(

"div"

);



user.className="message user";


user.innerHTML =

"👤 " + text;



box.appendChild(user);




const ai = document.createElement(

"div"

);



ai.className="message ai";


ai.innerHTML =

"🤖 HalDo AI: Deine Nachricht wurde empfangen.";



box.appendChild(ai);



input.value="";



}