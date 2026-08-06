// =================================
// HalDo Document Center
// =================================


function saveDocument(){


let title =
document.getElementById(
"title"
).value;


let text =
document.getElementById(
"text"
).value;



let documentData = {

title:title,

text:text,

date:new Date()

};



localStorage.setItem(

"haldo_document",

JSON.stringify(documentData)

);



document.getElementById(
"result"
).innerHTML =

"✅ Dokument gespeichert";


}



function back(){

window.history.back();

}