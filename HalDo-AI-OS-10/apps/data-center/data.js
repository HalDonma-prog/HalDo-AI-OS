// =================================
// HalDo Data Center
// =================================



function createBackup(){


let backup = {


system:"HalDo AI OS",

version:"16.0",

date:new Date(),


data:{

profile:
localStorage.getItem(
"haldo_profile"
),


settings:
localStorage.getItem(
"haldo_settings"
),


apps:
localStorage.getItem(
"haldo_apps"
),


documents:
localStorage.getItem(
"haldo_document"
)


}


};




localStorage.setItem(

"haldo_backup",

JSON.stringify(backup)

);



document.getElementById(
"backupStatus"
).innerHTML =

"✅ Backup erfolgreich erstellt";


}




function showStorage(){


let count =
localStorage.length;



document.getElementById(
"storage"
).innerHTML =

"Daten gespeichert: "
+count;


}



showStorage();





function clearData(){


let confirmDelete =
confirm(
"Sollen lokale Daten gelöscht werden?"
);



if(confirmDelete){


localStorage.clear();


alert(
"Daten gelöscht"
);


}


}




function back(){

window.history.back();

}