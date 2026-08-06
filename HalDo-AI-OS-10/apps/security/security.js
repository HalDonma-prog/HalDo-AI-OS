// =================================
// HalDo Security Center
// =================================


const user = {


username:"HaDon",

role:"admin",

status:"active"


};



document.getElementById(
"user"
).innerHTML =

"👤 "
+user.username;



document.getElementById(
"role"
).innerHTML =

"Rolle: "
+user.role;




function checkSecurity(){


alert(

"🛡️ Sicherheit geprüft"

);


}




function back(){

window.history.back();

}