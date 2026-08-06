// =====================================
// HalDo Settings Core
// =====================================


const HalDoSettings = {


data:{


language:"de",

theme:"dark",

version:"16.0"


},



save(){


HalDoStorage.save(
"haldo_settings",
this.data
);


},



load(){


const saved =
HalDoStorage.load(
"haldo_settings"
);


if(saved){

this.data=saved;

}


return this.data;


},



set(key,value){


this.data[key]=value;

this.save();


}



};



window.HalDoSettings =
HalDoSettings;