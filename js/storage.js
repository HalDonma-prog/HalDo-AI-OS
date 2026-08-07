/*
=====================================

HalDo AI OS 18
Storage Manager

Professional Ultimate Foundation

Version:
18.0.0

=====================================
*/


const HalDoStorage = {



    data:{},





    load:function(name,url){


        return fetch(url)

        .then(response=>{


            if(!response.ok){


                throw new Error(
                "Datei nicht gefunden: "
                + url
                );


            }



            return response.json();



        })

        .then(json=>{


            this.data[name] = json;



            console.log(
            "💾 Daten geladen:",
            name
            );



            return json;



        })

        .catch(error=>{


            console.error(
            "❌ Ladefehler:",
            error
            );


        });



    },







    get:function(name){


        return this.data[name];


    },







    saveLocal:function(
        name,
        value
    ){


        localStorage.setItem(

            name,

            JSON.stringify(value)

        );



        console.log(
        "💾 Lokal gespeichert:",
        name
        );



    },







    loadLocal:function(name){


        const data =

        localStorage.getItem(
            name
        );



        if(data){


            return JSON.parse(
                data
            );


        }



        return null;



    }






};








window.HalDoStorage =
HalDoStorage;








window.addEventListener(
"load",
function(){



console.log(
"💾 Storage Manager bereit"
);



});