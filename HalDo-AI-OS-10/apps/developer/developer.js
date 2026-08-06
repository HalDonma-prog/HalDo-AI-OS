// =================================
// HalDo Developer Center
// =================================



function saveCode(){


let code =

document.getElementById(
"code"
).value;



localStorage.setItem(

"haldo_code",

code

);



alert(
"Code gespeichert"
);


}




function createProject(){


localStorage.setItem(

"developer_project",

"Neues HalDo Projekt"

);



document.getElementById(
"project"
).innerHTML =

"Neues Projekt erstellt";


}




function back(){

window.history.back();

}