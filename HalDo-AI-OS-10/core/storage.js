// ========================================
// HalDo AI OS 16
// Storage Manager
// ========================================


const HalDoStorage = {


    save(key, value){


        localStorage.setItem(

            "haldo_" + key,

            JSON.stringify(value)

        );


    },



    load(key){


        const data = localStorage.getItem(

            "haldo_" + key

        );


        if(!data){

            return null;

        }


        return JSON.parse(data);


    },



    remove(key){


        localStorage.removeItem(

            "haldo_" + key

        );


    },



    clear(){


        localStorage.clear();


    }


};



window.HalDoStorage = HalDoStorage;