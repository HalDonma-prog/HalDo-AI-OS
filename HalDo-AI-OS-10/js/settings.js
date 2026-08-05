/*
========================================
HalDo AI OS Professional 16.0

Settings Controller

========================================
*/

"use strict";


const HalDoSettings = {



    initialized: false,






    init(){



        if(this.initialized){


            return;


        }





        console.log(

            "⚙️ Einstellungen gestartet"

        );






        this.load();




        this.initialized = true;



    },








    load(){



        const theme =

        window.HalDoStorage

        ?

        HalDoStorage.get(

            "theme",

            "dark"

        )

        :

        "dark";







        const language =

        window.HalDoStorage

        ?

        HalDoStorage.get(

            "language",

            "de"

        )

        :

        "de";






        this.updateScreen(

            theme,

            language

        );



    },








    saveTheme(theme){



        if(window.HalDoStorage){



            HalDoStorage.save(

                "theme",

                theme

            );


        }





        this.load();



    },








    saveLanguage(language){



        if(window.HalDoStorage){



            HalDoStorage.save(

                "language",

                language

            );


        }





        this.load();



    },








    updateScreen(theme, language){



        const themeBox =

        document.getElementById(

            "current-theme"

        );



        const languageBox =

        document.getElementById(

            "current-language"

        );







        if(themeBox){



            themeBox.innerHTML =

            "🌙 Theme: " + theme;



        }







        if(languageBox){



            languageBox.innerHTML =

            "🌍 Sprache: " + language;



        }



    }






};





window.HalDoSettings = HalDoSettings;








document.addEventListener(

    "DOMContentLoaded",

    () => {



        if(

            document.getElementById(

                "current-theme"

            )

        ){



            HalDoSettings.init();



        }



    }

);