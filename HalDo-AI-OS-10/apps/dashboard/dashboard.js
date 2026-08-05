// =================================
// HalDo AI OS Dashboard
// =================================


const appContainer =
document.getElementById("apps");



const apps = [

{
name:"HalDo AI",
icon:"🤖",
link:"#"
},

{
name:"Health Center",
icon:"❤️",
link:"#"
},

{
name:"Mail Center",
icon:"📧",
link:"#"
},

{
name:"Document Center",
icon:"📝",
link:"#"
},

{
name:"Learning Center",
icon:"📚",
link:"#"
},

{
name:"Creative Center",
icon:"🎨",
link:"#"
}

];



apps.forEach(app=>{


const card =
document.createElement("div");


card.className =
"app-card";



card.innerHTML = `

<div class="icon">
${app.icon}
</div>

<h3>
${app.name}
</h3>


<button>
Öffnen
</button>

<button>
⚙️
</button>

`;



appContainer.appendChild(card);


});