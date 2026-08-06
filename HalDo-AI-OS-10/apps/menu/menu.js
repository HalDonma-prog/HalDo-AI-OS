// =================================
// HalDo Main Menu
// =================================



const box =
document.getElementById(
"menu"
);



fetch("../../data/apps.json")

.then(res=>res.json())

.then(data=>{


data.apps.forEach(app=>{


if(app.active){


let div =
document.createElement(
"div"
);


div.className="app";


div.innerHTML=

`

<h2>

${app.icon}

</h2>


<h3>

${app.name}

</h3>


<button>

Öffnen

</button>

`;



div.querySelector(
"button"
)
.onclick=function(){


window.location.href =
"../../"+app.path;


};



box.appendChild(div);


}


});


});