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
// ===============================
// HALDO PDF CREATOR
// ===============================


function savePDFDocument(){


    const title = document.getElementById(
        "pdfTitle"
    ).value;


    const content = document.getElementById(
        "pdfContent"
    ).value;



    const pdfDraft = {

        title: title,

        content: content,

        date: new Date().toLocaleString()

    };



    localStorage.setItem(
        "haldoPDFDraft",
        JSON.stringify(pdfDraft)
    );



    document.getElementById(
        "pdfMessage"
    ).innerHTML =
    "✅ PDF Entwurf gespeichert";


}







// ===============================
// HALDO PDF CREATOR v4.2
// ===============================


function createPDF(){


    const sender = document.getElementById("pdfSender").value;

    const receiver = document.getElementById("pdfReceiver").value;

    const date = document.getElementById("pdfDate").value;

    const title = document.getElementById("pdfTitle").value;

    const content = document.getElementById("pdfContent").value;

    const signature = document.getElementById("pdfSignature").value;



    if(title === "" || content === ""){

        alert("Bitte Titel und Inhalt eingeben.");

        return;

    }



    const { jsPDF } = window.jspdf;


    const doc = new jsPDF();



    let y = 20;



    doc.setFontSize(18);

    doc.text(
        "HalDo AI OS Dokument",
        20,
        y
    );


    y += 15;


    doc.setFontSize(12);



    doc.text(
        "Absender: " + sender,
        20,
        y
    );


    y += 10;


    doc.text(
        "Empfänger: " + receiver,
        20,
        y
    );


    y += 10;


    doc.text(
        "Datum: " + date,
        20,
        y
    );


    y += 15;



    doc.setFontSize(16);

    doc.text(
        title,
        20,
        y
    );


    y += 15;


    doc.setFontSize(12);



    const textLines = doc.splitTextToSize(
        content,
        170
    );


    doc.text(
        textLines,
        20,
        y
    );


    y += textLines.length * 7 + 15;



    doc.text(
        "Unterschrift: " + signature,
        20,
        y
    );



    doc.save(
        title + ".pdf"
    );



    document.getElementById(
        "pdfMessage"
    ).innerHTML =
    "✅ Professionelles PDF erstellt";


}