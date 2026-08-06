// =================================
// HalDo Creative Center
// =================================


function createProject(type){


let projects =
JSON.parse(

localStorage.getItem(
"creative_projects"
)

)
|| [];



let project = {


type:type,

date:new Date()

};



projects.push(project);



localStorage.setItem(

"creative_projects",

JSON.stringify(projects)

);



document.getElementById(
"projects"
).innerHTML =

"✅ Projekt erstellt: "
+type;


}



function back(){

window.history.back();

}