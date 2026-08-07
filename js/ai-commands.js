/*
=====================================

HalDo AI OS 18
AI Command System

Professional Ultimate Foundation

Version 18.0.0

=====================================
*/


const HalDoCommands = {


    commands:{


        dashboard:
        "dashboard.html",


        apps:
        "apps.html",


        settings:
        "settings.html",


        modules:
        "modules.html",


        status:
        "status.html",


        ai:
        "ai-core.html"


    },







    execute(message){


        const text =

        message.toLowerCase();





        for(
            let command in this.commands
        ){



            if(
                text.includes(command)
            ){


                this.openPage(

                    this.commands[command]

                );



                return (

                "🚀 Öffne "

                + command

                );



            }


        }






        return null;



    },







    openPage(page){


        window.location.href =
        page;



    }







};






window.HalDoCommands =
HalDoCommands;