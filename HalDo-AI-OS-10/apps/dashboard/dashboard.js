// ==========================================
// HalDo Dashboard
// ==========================================


const apps = [


{
name:"HalDo AI Chat",
icon:"🤖",
link:"../chat/index.html"
},


{
name:"Language Center",
icon:"🌍",
link:"#"
},


{
name:"Settings",
icon:"⚙️",
link:"../settings/index.html"
},


{
name:"Health Center",
icon:"❤️",
link:"#"
}


];



const container =
document.getElementById("apps");



apps.forEach(app=>{


let card =
document.createElement("div");


card.className="card";



card.innerHTML=`

<div class="icon">
${app.icon}
</div>

<h3>
${app.name}
</h3>


<button onclick="openApp('${app.link}')">

Öffnen

</button>

`;



container.appendChild(card);


});




function openApp(link){

window.location.href=link;

}