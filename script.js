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



function sendMessage(){

let input=document.getElementById("messageInput");

let text=input.value.trim();


if(text===""){
return;
}


let messages=JSON.parse(localStorage.getItem("chat")) || [];


messages.push({
user:"Du",
text:text
});


localStorage.setItem("chat",JSON.stringify(messages));


input.value="";


loadMessages();

}



function loadMessages(){

let chat=document.getElementById("chatBox");


chat.innerHTML="";


let messages=JSON.parse(localStorage.getItem("chat")) || [];


if(messages.length===0){

chat.innerHTML=
'<div class="message bot">Willkommen im Chat 👋</div>';

}



messages.forEach(function(item){


let div=document.createElement("div");

div.className="message user";

div.innerText=item.user+": "+item.text;


chat.appendChild(div);


});


chat.scrollTop=chat.scrollHeight;

}



window.onload=function(){


let input=document.getElementById("messageInput");


input.addEventListener("keydown",function(event){


if(event.key==="Enter"){

event.preventDefault();

sendMessage();

}


});


};