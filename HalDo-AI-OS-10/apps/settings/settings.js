// =====================================
// HalDo AI OS Settings
// =====================================



function saveLanguage(){


const language = document.getElementById(

"language"

).value;



if(window.HalDoStorage){


HalDoStorage.save(

"language",

language

);


}



alert(

"Sprache gespeichert"

);



}





function toggleTheme(){


document.body.classList.toggle(

"dark"

);



}





function securityInfo(){


alert(

"🔐 Sicherheitssystem aktiv"

);



}





function checkUpdates(){


alert(

"🔄 Update-System vorbereitet"

);



}





function openProfile(){


alert(

"👤 Profil-System kommt in nächster Version"

);



}