// ==========================================
// HalDo Settings Manager
// ==========================================


const HalDoSettings = {


    data:{


        language:"de",

        theme:"dark",

        notifications:true


    },


    set(key,value){


        this.data[key]=value;

        this.save();


    },


    get(key){


        return this.data[key];


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


    }


};


window.HalDoSettings =
HalDoSettings;