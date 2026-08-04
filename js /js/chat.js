/* =====================================
   HALDO AI CHAT v1.0
===================================== */


function sendMessage(){


const input =

document.getElementById(
"userInput"
);



const chatBox =

document.getElementById(
"chatBox"
);



const message =

input.value.trim();



if(!message){

return;

}





const userMessage =

document.createElement(
"div"
);


userMessage.className =
"user-message";


userMessage.innerHTML =

"👤 " + message;



chatBox.appendChild(
userMessage
);





let answer =

getHalDoAnswer(
message
);





setTimeout(()=>{


const aiMessage =

document.createElement(
"div"
);



aiMessage.className =

"ai-message";



aiMessage.innerHTML =

"🤖 " + answer;



chatBox.appendChild(
aiMessage
);



chatBox.scrollTop =

chatBox.scrollHeight;



},500);





input.value="";


}







function getHalDoAnswer(text){


text =

text.toLowerCase();





if(text.includes("hallo")
|| text.includes("hi")){


return "Hallo 💙 Ich bin HalDo AI OS.";

}





if(text.includes("wer bist du")){


return "Ich bin HalDo AI, dein intelligenter Assistent.";

}





if(text.includes("was kannst du")){


return "Ich kann helfen mit Chat, Dateien, Lernen, Kreativität und mehr.";

}





if(text.includes("musik")){


return "🎵 Music AI ist vorbereitet.";

}





if(text.includes("bild")){


return "🖼️ Image AI ist vorbereitet.";

}





return "💙 Ich habe deine Frage erhalten und werde weiter lernen.";

}