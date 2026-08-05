/*
========================================
HalDo AI OS Professional 16.0

Application Boot Controller

========================================
*/


"use strict";





const HalDoApp = {



    version: "16.0.0",






    start(){



        console.log(

            "🚀 HalDo AI OS Start..."

        );






        this.checkCore();






        if(window.HalDoKernel){



            HalDoKernel.boot();



        }






        if(window.HalDoSystem){



            HalDoSystem.init();



        }






        this.updateStatus();



    },









    checkCore(){



        const modules = [



            "HalDoKernel",

            "HalDoEvents",

            "HalDoStorage",

            "HalDoRouter",

            "HalDoSystem"



        ];






        modules.forEach(

            module => {



                if(window[module]){



                    console.log(

                        "✅",

                        module,

                        "bereit"

                    );



                }

                else {



                    console.warn(

                        "⚠️",

                        module,

                        "fehlt"

                    );



                }



            }

        );



    },









    updateStatus(){



        const status =

        document.getElementById(

            "system-status"

        );






        if(status){



            status.className =

            "status-box status-online";






            status.innerHTML =



            "🟢 HalDo AI OS 16.0 Online";



        }



    }






};









window.HalDoApp = HalDoApp;









document.addEventListener(

    "DOMContentLoaded",

    function(){



        HalDoApp.start();



    }

);