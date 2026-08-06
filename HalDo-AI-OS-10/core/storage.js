// =====================================
// HalDo Storage System
// =====================================


const HalDoStorage = {


save(key,data){

localStorage.setItem(
key,
JSON.stringify(data)
);

},



load(key){


const value =
localStorage.getItem(key);



return value
?
JSON.parse(value)
:
null;


},



remove(key){

localStorage.removeItem(key);

}


};



window.HalDoStorage =
HalDoStorage;