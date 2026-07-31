// ==================================
// HalDo AI Dashboard - Version 1.2
// ==================================

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        const title = card.querySelector("h2").textContent;
        const button = card.querySelector("button");

        button.addEventListener("click", () => {

            if (title.includes("KI Chat")) {

                window.location.href = "chat.html";

            } else {

                alert(
                    title +
                    "\n\nDiese Funktion wird in einer der nächsten Versionen verfügbar sein. 🚀"
                );

            }

        });

    });

});