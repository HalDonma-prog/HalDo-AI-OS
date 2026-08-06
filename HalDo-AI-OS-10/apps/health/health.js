// =================================
// HalDo Health Center
// =================================


function saveBlood(){

let value =
document.getElementById(
"blood"
).value;


localStorage.setItem(
"blood_pressure",
value
);


document.getElementById(
"bloodResult"
).innerHTML =
"Gespeichert: "+value;

}



function saveDiabetes(){

localStorage.setItem(

"diabetes",

document.getElementById(
"diabetes"
).value

);

}



function saveMedicine(){

localStorage.setItem(

"medicine",

document.getElementById(
"medicine"
).value

);

}



function saveSport(){

localStorage.setItem(

"sport",

document.getElementById(
"sport"
).value

);

}




function back(){

window.history.back();

}