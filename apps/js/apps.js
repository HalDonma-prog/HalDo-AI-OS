/*
========================================
HalDo AI OS Professional 16.0

AI Chat Controller

========================================
*/

"use strict";


const HalDoChat = {



    messages: [],


    initialized: false,






    init(){



        if(this.initialized){


            return;


        }





        console.log(

            "🤖 KI Chat gestartet"

        );





        this.load();



        this.initialized = true;



    },








    send(message){



        if(!message){



            return;


        }







        const userMessage = {


            type: "user",


            text: message,


            time: new Date()

        };





        this.messages.push(

            userMessage

        );







        const response = {


            type: "ai",


            text:

            "Hallo! Ich bin HalDo AI. Wie kann ich helfen?",


            time: new Date()


        };





        this.messages.push(

            response

        );






        this.render();



    },








    load(){



        if(window.HalDoStorage){



            this.messages =

            HalDoStorage.get(

                "chat_messages",

                []

            );



        }



    },








    save(){



        if(window.HalDoStorage){



            HalDoStorage.save(

                "chat_messages",

                this.messages

            );


        }



    },








    render(){



        const area =

        document.getElementById(

            "chat-area"

        );





        if(!area){


            return;


        }






        area.innerHTML = "";







        this.messages.forEach(



            message => {



                const div =

                document.createElement(

                    "div"

                );



                div.className =

                "chat-message " +

                message.type;



                div.innerHTML =

                message.text;



                area.appendChild(

                    div

                );



            }


        );






        this.save();



    }







};





window.HalDoChat = HalDoChat;







document.addEventListener(

    "DOMContentLoaded",

    () => {



        if(

            document.getElementById(

                "chat-area"

            )

        ){



            HalDoChat.init();



        }



    }

);