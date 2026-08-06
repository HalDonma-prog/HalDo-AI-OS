// =====================================
// HalDo AI OS Storage
// =====================================


const HalDoStorage = {


save(key,value){

    localStorage.setItem(

        "haldo_"+key,

        JSON.stringify(value)

    );

},



load(key){


    const data = localStorage.getItem(

        "haldo_"+key

    );


    return data ? JSON.parse(data) : null;


},



remove(key){

    localStorage.removeItem(

        "haldo_"+key

    );

}


};



window.HalDoStorage = HalDoStorage;