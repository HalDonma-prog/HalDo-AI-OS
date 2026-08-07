/*
========================================

HalDo AI OS 18
Scheduler Foundation

Version:
18.0.0

System Task Scheduler Layer

========================================
*/


const SchedulerSystem = {


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
            "⏱️ Scheduler System startet..."
        );


        this.status =
        "starting";


        this.load();


    },



    load(){


        this.status =
        "active";



        console.log(
            "⏱️ Scheduler aktiv"
        );


    },



    addTask(name,callback,time){


        const task = {


            id:
            Date.now(),


            name:
            name,


            callback:
            callback,


            time:
            time,


            status:
            "waiting"


        };



        this.tasks.push(
            task
        );



        console.log(
            "➕ Aufgabe hinzugefügt:",
            task
        );



        return task;


    },



    runTask(id){


        const task =
        this.tasks.find(

            item =>
            item.id === id

        );



        if(task){


            task.status =
            "running";



            if(
                typeof task.callback === "function"
            ){


                task.callback();


            }



            task.status =
            "completed";



            console.log(
                "✅ Aufgabe abgeschlossen:",
                task.name
            );


        }


    },



    removeTask(id){


        this.tasks =
        this.tasks.filter(

            task =>
            task.id !== id

        );


        console.log(
            "🗑️ Aufgabe entfernt:",
            id
        );


    },



    getTasks(){


        return this.tasks;


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

SchedulerSystem.initialize();



console.log(
    "⏱️ HalDo Scheduler geladen"
);