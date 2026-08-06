// ===================================
// HalDo Dashboard System 16.0
// ===================================


let apps = [


{
id:"ai",
name:"HalDo AI",
icon:"🤖",
blocked:false
},


{
id:"health",
name:"Health Center",
icon:"❤️",
blocked:false
},


{
id:"language",
name:"Language Center",
icon:"🌍",
blocked:false
},


{
id:"documents",
name:"Document Center",
icon:"📝",
blocked:false
},


{
id:"learning",
name:"Learning Center",
icon:"📚",
blocked:false
},


{
id:"creative",
name:"Creative Center",
icon:"🎨",
blocked:false
}


];




const container =
document.getElementById(
"appContainer"
);





function renderApps(){


container.innerHTML="";



apps.forEach(app=>{


const card =
document.createElement(
"div"
);



card.className =
"app-card";



if(app.blocked){

card.classList.add(
"blocked"
);

}



card.innerHTML=`

<div class="app-icon">

${app.icon}

</div>


<h3>

${app.name}

</h3>


<p>

Status:
${app.blocked
?"🔒 Blockiert"
:"✅ Aktiv"}

</p>



<div class="actions">


<button class="open"
onclick="openApp('${app.id}')">

Öffnen

</button>



<button
onclick="editApp('${app.id}')">

✏️

</button>



<button class="block"
onclick="blockApp('${app.id}')">

🔒

</button>



<button class="delete"
onclick="deleteApp('${app.id}')">

🗑️

</button>


</div>

`;



container.appendChild(card);



});


}





function openApp(id){


alert(
"Öffne App: "
+id
);


}





function editApp(id){


alert(
"Bearbeiten: "
+id
);


}





function blockApp(id){


const app =
apps.find(
a=>a.id===id
);



if(app){

app.blocked =
!app.blocked;

renderApps();

}



}





function deleteApp(id){


const confirmDelete =
confirm(
"App wirklich entfernen?"
);



if(confirmDelete){


apps =
apps.filter(
a=>a.id!==id
);


renderApps();


}


}





function openSettings(){


window.location.href =
"../settings/index.html";


}





renderApps();