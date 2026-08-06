// ========================================
// HalDo AI OS 16
// Application Manager
// ========================================


const HalDoAppManager = {


    apps:{},



    register(id, config){


        this.apps[id] = config;


    },



    get(id){


        return this.apps[id] || null;


    },



    list(){


        return Object.keys(this.apps);


    },



    remove(id){


        if(this.apps[id]){


            delete this.apps[id];


            return true;


        }


        return false;


    },



    launch(id){


        const app = this.get(id);



        if(!app){


            console.error(

                "App nicht registriert:",

                id

            );


            return;


        }



        if(HalDoRouter){


            HalDoRouter.open(id);


        }


    }



};



window.HalDoAppManager = HalDoAppManager;