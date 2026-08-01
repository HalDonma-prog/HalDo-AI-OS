/*
HalDo AI OS v4.0
script.js
Grundfunktionen
*/


// ===============================
// SEITEN NAVIGATION
// ===============================


function openPage(pageId) {


    const pages = document.querySelectorAll(".page");


    pages.forEach(page => {

        page.classList.add("hidden");

    });


    const selectedPage = document.getElementById(pageId);


    if(selectedPage){

        selectedPage.classList.remove("hidden");

    }


}



// ===============================
// NOTIZEN SYSTEM
// ===============================


let notes = JSON.parse(
    localStorage.getItem("haldoNotes")
) || [];





function saveNote(){


    const input = document.getElementById("noteInput");


    const text = input.value.trim();



    if(text === ""){

        alert("Bitte eine Notiz eingeben.");

        return;

    }



    notes.push({

        id: Date.now(),

        text: text

    });



    localStorage.setItem(
        "haldoNotes",
        JSON.stringify(notes)
    );



    input.value = "";


    renderNotes();


}







function renderNotes(){


    const list = document.getElementById(
        "noteList"
    );



    if(!list){

        return;

    }



    list.innerHTML = "";



    notes.forEach(note => {



        const div = document.createElement(
            "div"
        );


        div.className = "note-item";



        div.innerHTML = `

            <p>${note.text}</p>

            <button onclick="deleteNote(${note.id})">
            🗑️ Löschen
            </button>

        `;



        list.appendChild(div);



    });



}







function deleteNote(id){



    notes = notes.filter(
        note => note.id !== id
    );



    localStorage.setItem(
        "haldoNotes",
        JSON.stringify(notes)
    );



    renderNotes();



}







// ===============================
// START
// ===============================



document.addEventListener(
    "DOMContentLoaded",
    function(){


        renderNotes();


        openPage("dashboard");


    }
);