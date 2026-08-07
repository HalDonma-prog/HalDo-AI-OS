/*
=====================================

HalDo AI OS 18
AI Memory System

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoMemory = {


    key:

    "haldo_ai_memory",





    data:{


        user:"",


        language:"de",


        conversations:[],


        settings:{}


    },







    load(){


        const saved =

        localStorage.getItem(

            this.key

        );



        if(saved){


            this.data =

            JSON.parse(saved);



            console.log(

            "🧠 AI Memory geladen"

            );


        }

        else{


            this.save();


        }


    },







    save(){


        localStorage.setItem(

            this.key,

            JSON.stringify(

                this.data

            )

        );


    },







    setUser(name){


        this.data.user = name;


        this.save();


    },







    setLanguage(language){


        this.data.language = language;


        this.save();


    },







    addConversation(user, ai){


        this.data.conversations.push({


            user:user,


            ai:ai,


            time:

            new Date().toISOString()



        });



        this.save();


    },







    getConversations(){


        return this.data.conversations;


    },







    clear(){


        this.data = {


            user:"",


            language:"de",


            conversations:[],


            settings:{}


        };



        this.save();


        console.log(

        "🧹 AI Memory gelöscht"

        );


    }




};






window.HalDoMemory =
HalDoMemory;







window.addEventListener(

"load",

()=>{


HalDoMemory.load();



});