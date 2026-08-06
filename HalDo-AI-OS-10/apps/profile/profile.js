// =================================
// HalDo Profile Center
// =================================


function saveProfile(){


const profile = {


name:
document.getElementById(
"name"
).value,


email:
document.getElementById(
"email"
).value,


country:
document.getElementById(
"country"
).value,


language:
document.getElementById(
"language"
).value


};



localStorage.setItem(

"haldo_profile",

JSON.stringify(profile)

);



document.getElementById(
"result"
).innerHTML =

"✅ Profil gespeichert";


}




function back(){

window.history.back();

}