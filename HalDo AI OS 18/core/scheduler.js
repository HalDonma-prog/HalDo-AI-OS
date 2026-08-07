/*
========================================

HalDo AI OS 18
Scheduler Foundation

Version:
18.0.0

System Task Management Layer

========================================
*/


const Scheduler = {


    name:
    "HalDo Scheduler",


    version:
    "18.0.0",


    status:
    "offline",


    tasks:
    [],



    initialize(){


        console.log(
            "⏱️ Scheduler Initialisierung..."
        );


        this.status =
        "starting";


        this.start();


    },



    start(){


        this.status =
        "active";



        if(
            typeof Logger !== "undefined"
        ){

            Logger.info(
                "Scheduler gestartet"
            );

        }



        if(
            typeof EventBus !== "undefined"
        ){

            EventBus.emit(
                "scheduler.ready",
                {

                    status:
                    this.status

                }

            );

        }



        console.log(
            "⏱️ HalDo Scheduler bereit"
        );


    },



    addTask(
        name,
        action,
        interval
    ){


        const task = {


            name:
            name,


            action:
            action,


            interval:
            interval,


            status:
            "waiting"


        };



        this.tasks.push(
            task
        );



        console.log(
            "⏱️ Aufgabe hinzugefügt:",
            name
        );



        return task;


    },



    runTask(
        name
    ){


        const task =
        this.tasks.find(
            item =>
            item.name === name
        );



        if(
            !task
        ){

            console.warn(
                "🟡 Aufgabe nicht gefunden:",
                name
            );


            return false;

        }



        try {


            task.action();



            task.status =
            "completed";



            console.log(
                "🟢 Aufgabe abgeschlossen:",
                name
            );


        }
        catch(error){


            task.status =
            "error";


            console.error(
                "🔴 Scheduler Fehler:",
                error
            );


        }



        return true;


    },



    getTasks(){


        return this.tasks;


    },



    clear(){


        this.tasks = [];



        console.log(
            "⏱️ Aufgaben gelöscht"
        );


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            tasks:
            this.tasks.length


        };


    }


};





// Scheduler starten

Scheduler.initialize();