/*
========================================
HalDo AI OS Professional Ultimate 16.0

Core Router System

========================================
*/


"use strict";


const HalDoRouter = {


    routes: {},


    current: null,









    register(name, path){


        this.routes[name] = path;




        if(window.HalDoLogger){



            HalDoLogger.info(

                "Route registriert: " + name

            );



        }



    },









    navigate(name){



        const path =

        this.routes[name];






        if(!path){



            if(window.HalDoLogger){


                HalDoLogger.warning(

                    "Route nicht gefunden: " + name

                );


            }



            return false;


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



        return true;



    },









    getCurrent(){



        return this.current;



    },









    getRoutes(){



        return this.routes;



    }






};






window.HalDoRouter = HalDoRouter;