// =================================
// HalDo Mail Center
// =================================


function sendMail(){


let mail = {


receiver:
document.getElementById(
"receiver"
).value,


subject:
document.getElementById(
"subject"
).value,


message:
document.getElementById(
"message"
).value,


date:
new Date()


};



localStorage.setItem(

"haldo_mail",

JSON.stringify(mail)

);



document.getElementById(
"result"
).innerHTML =

"✅ Nachricht gespeichert";


}



function back(){

window.history.back();

}