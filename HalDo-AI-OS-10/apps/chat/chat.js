// ==========================================
// HalDo AI Chat
// ==========================================


function sendMessage(){


const input =
document.getElementById(
"message"
);



const chat =
document.getElementById(
"chat"
);



if(input.value==="")
return;



chat.innerHTML += `

<p>

👤 Du:
${input.value}

</p>


<p>

🤖 HalDo AI:
Ich habe deine Nachricht erhalten.

</p>

`;



input.value="";


}



function back(){

window.history.back();

}