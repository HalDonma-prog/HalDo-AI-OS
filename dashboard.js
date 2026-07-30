// ==================================
// HalDo AI Dashboard - Version 1.1
// ==================================

document.addEventListener("DOMContentLoaded", () => {

    const buttons = document.querySelectorAll(".card button");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            const card = button.parentElement;
            const title = card.querySelector("h2").textContent;

            alert(
                title +
                "\n\nDiese Funktion befindet sich gerade im Aufbau.\n\n" +
                "Sie wird in einer der nächsten Versionen verfügbar sein. 🚀"
            );

        });

    });

});
