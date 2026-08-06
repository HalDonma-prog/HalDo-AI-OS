// =================================
// HalDo AI OS 18
// Module Manager
// =================================


const ModuleManager = {


loaded:[],



load(name){


this.loaded.push(name);


console.log(
"🟢 Modul geladen:",
name
);


},



start(){


this.load("AI Core");

this.load("Security");

this.load("Database");


console.log(
"🚀 Alle Foundation Module aktiv"
);


}


};



ModuleManager.start();