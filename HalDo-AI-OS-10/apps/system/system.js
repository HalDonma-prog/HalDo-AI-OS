// =================================
// HalDo System Center
// =================================



document.getElementById(
"version"
).innerHTML =
"16.0";



document.getElementById(
"status"
).innerHTML =
"✅ Aktiv";




const appList = [

"🤖 AI Chat",

"🌍 Language",

"❤️ Health",

"📝 Documents",

"🎨 Creative",

"📧 Mail",

"🧑‍💻 Developer"

];



document.getElementById(
"apps"
).innerHTML =

appList.join("<br>");





function backup(){


let data = {


system:"HalDo AI OS",

date:new Date(),

version:"16.0"


};



localStorage.setItem(

"haldo_backup",

JSON.stringify(data)

);



alert(
"✅ Backup erstellt"
);


}





function checkUpdate(){


alert(

"🔄 System ist aktuell"

);


}





function back(){

window.history.back();

}