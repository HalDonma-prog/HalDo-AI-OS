// =================================
// HalDo Learning Center
// =================================


function startLearning(type){


let progress =
localStorage.getItem(
"learning_progress"
)
|| 0;



progress =
Number(progress)+10;



if(progress>100){

progress=100;

}



localStorage.setItem(

"learning_progress",

progress

);



document.getElementById(
"progress"
).innerHTML =
progress+"%";



alert(
"Lernen gestartet: "+type
);


}



function back(){

window.history.back();

}