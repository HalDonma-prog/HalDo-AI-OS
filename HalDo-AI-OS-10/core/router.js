/*
========================================
HalDo AI OS Professional 16.0
Ultimate Foundation

Core Router System
========================================
*/


"use strict";


const HalDoRouter = {


    current: null,


    routes: {},





    register(name, path){


        this.routes[name] = path;



        if(window.HalDoLogger){


            HalDoLogger.info(

                "Route registriert: "
                + name

            );


        }


    },







    navigate(name){



        const path =

        this.routes[name];




        if(!path){



            if(window.HalDoLogger){


                HalDoLogger.warning(

                    "Route nicht gefunden: "
                    + name

                );


            }



            return;


        }






        this.current = name;




        if(window.HalDoEvents){


            HalDoEvents.emit(

                "route-change",

                {

                    page: name,

                    path: path

                }

            );


        }






        window.location.href = path;



    },







    getCurrent(){


        return this.current;


    },







    getRoutes(){


        return this.routes;


    }





};





window.HalDoRouter = HalDoRouter;