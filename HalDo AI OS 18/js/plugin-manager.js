/*
========================================

HalDo AI OS 18
Plugin Manager

Version:
18.0.0

Plugin Control System

========================================
*/


const PluginManager = {


    name:
    "HalDo Plugin Manager",


    version:
    "18.0.0",


    status:
    "offline",



    plugins:
    [],



    initialize(){


        console.log(
            "🧩 Plugin Manager startet..."
        );


        this.status =
        "starting";


        this.loadDefaultPlugins();


    },



    loadDefaultPlugins(){


        this.plugins = [


            {


                name:
                "System Tools",


                version:
                "1.0.0",


                status:
                "ready"


            },


            {


                name:
                "AI Extension",


                version:
                "1.0.0",


                status:
                "ready"


            }


        ];



        this.status =
        "ready";



        console.log(
            "🧩 Plugins geladen:",
            this.plugins
        );


    },



    installPlugin(plugin){


        this.plugins.push(
            plugin
        );



        console.log(
            "➕ Plugin installiert:",
            plugin.name
        );


    },



    removePlugin(name){


        this.plugins =
        this.plugins.filter(

            plugin =>
            plugin.name !== name

        );



        console.log(
            "🗑️ Plugin entfernt:",
            name
        );


    },



    enablePlugin(name){


        const plugin =
        this.getPlugin(name);



        if(plugin){


            plugin.status =
            "active";



            console.log(
                "🟢 Plugin aktiviert:",
                name
            );


        }


    },



    disablePlugin(name){


        const plugin =
        this.getPlugin(name);



        if(plugin){


            plugin.status =
            "disabled";



            console.log(
                "🔴 Plugin deaktiviert:",
                name
            );


        }


    },



    getPlugin(name){


        return this.plugins.find(

            plugin =>
            plugin.name === name

        );


    },



    getPlugins(){


        return this.plugins;


    },



    getStatus(){


        return {


            name:
            this.name,


            version:
            this.version,


            status:
            this.status,


            plugins:
            this.plugins.length


        };


    }


};





PluginManager.initialize();



console.log(
    "🧩 HalDo Plugin Manager geladen"
);