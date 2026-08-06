// =================================
// HalDo Central App Manager
// =================================


const HalDoAppManager = {


apps:[],


load(){

fetch("../../data/apps.json")

.then(response=>response.json())

.then(data=>{

this.apps=data.apps;

this.render();

});


},



getApps(){

return this.apps;

},




open(app){


if(app.active){

window.location.href =
"../../"+app.path;

}


},




disable(id){


let app =
this.apps.find(
a=>a.id===id
);


if(app){

app.active=false;

}


},



enable(id){


let app =
this.apps.find(
a=>a.id===id
);


if(app){

app.active=true;

}


}



};



window.HalDoAppManager =
HalDoAppManager;