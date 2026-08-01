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
// ===============================
// HALDO SCHREIBASSISTENT v4.3
// ===============================


function prepareDocument(){


    const type = document.getElementById(
        "documentType"
    ).value;


    const title = document.getElementById(
        "writingTitle"
    ).value;


    const content = document.getElementById(
        "writingContent"
    ).value;



    if(title === "" || content === ""){

        alert(
            "Bitte Titel und Inhalt eingeben."
        );

        return;

    }



    let prefix = "";



    if(type === "brief"){

        prefix =
        "Sehr geehrte Damen und Herren,\n\n";

    }


    if(type === "email"){

        prefix =
        "Hallo,\n\n";

    }


    if(type === "bewerbung"){

        prefix =
        "Bewerbung\n\n";

    }


    if(type === "rechnung"){

        prefix =
        "Rechnung\n\n";

    }




    const preparedText =
    prefix +
    content +
    "\n\nMit freundlichen Grüßen";




    document.getElementById(
        "writingContent"
    ).value = preparedText;




    document.getElementById(
        "writingMessage"
    ).innerHTML =
    "✅ Dokument vorbereitet";

}








// ===============================
// SCHREIBASSISTENT → PDF CREATOR
// ===============================


function sendToPDF(){


    const title = document.getElementById(
        "writingTitle"
    ).value;


    const content = document.getElementById(
        "writingContent"
    ).value;



    if(title === "" || content === ""){


        alert(
            "Bitte zuerst ein Dokument erstellen."
        );


        return;

    }



    localStorage.setItem(
        "haldoPDFTitle",
        title
    );


    localStorage.setItem(
        "haldoPDFContent",
        content
    );



    // Wechsel zum PDF Bereich

    openPage("pdf");



    // Daten in PDF Felder einsetzen

    setTimeout(function(){


        document.getElementById(
            "pdfTitle"
        ).value = title;



        document.getElementById(
            "pdfContent"
        ).value = content;



        document.getElementById(
            "pdfMessage"
        ).innerHTML =
        "✅ Dokument vom Schreibassistent übernommen";


    },100);


}


    const title = document.getElementById(
        "writingTitle"
    ).value;


    const content = document.getElementById(
        "writingContent"
    ).value;



    if(title === "" || content === ""){

        alert(
            "Bitte erst ein Dokument erstellen."
        );

        return;

    }



    localStorage.setItem(
        "haldoPDFTitle",
        title
    );


    localStorage.setItem(
        "haldoPDFContent",
        content
    );



    document.getElementById(
        "writingMessage"
    ).innerHTML =
    "✅ Für PDF vorbereitet";

}
// ===============================
// HALDO MAIL v4.4
// ===============================


function prepareMail(){


    const receiver = document.getElementById(
        "mailReceiver"
    ).value;


    const subject = document.getElementById(
        "mailSubject"
    ).value;


    const content = document.getElementById(
        "mailContent"
    ).value;



    if(receiver === "" || subject === "" || content === ""){


        alert(
            "Bitte Empfänger, Betreff und Nachricht ausfüllen."
        );


        return;

    }



    const preparedMail =

    "An: " + receiver +
    "\n\n" +

    "Betreff: " + subject +
    "\n\n" +

    content;



    document.getElementById(
        "mailContent"
    ).value = preparedMail;



    document.getElementById(
        "mailMessage"
    ).innerHTML =
    "✅ E-Mail vorbereitet";


}







function mailToPDF(){


    const subject = document.getElementById(
        "mailSubject"
    ).value;


    const content = document.getElementById(
        "mailContent"
    ).value;



    if(subject === "" || content === ""){


        alert(
            "Bitte zuerst eine E-Mail erstellen."
        );


        return;

    }



    localStorage.setItem(
        "haldoPDFTitle",
        subject
    );


    localStorage.setItem(
        "haldoPDFContent",
        content
    );



    document.getElementById(
        "mailMessage"
    ).innerHTML =
    "✅ E-Mail für PDF vorbereitet";


}
// ===============================
// HALDO SCANNER v4.5
// ===============================


function saveScan(){


    const title = document.getElementById(
        "scanTitle"
    ).value;


    const file = document.getElementById(
        "scanFile"
    ).files[0];



    if(title === "" || !file){


        alert(
            "Bitte Name und Bild auswählen."
        );


        return;

    }



    const scanData = {


        title: title,

        fileName: file.name,

        date: new Date().toLocaleString()


    };



    localStorage.setItem(
        "haldoLastScan",
        JSON.stringify(scanData)
    );



    document.getElementById(
        "scanMessage"
    ).innerHTML =
    "✅ Scan gespeichert";

}







function scanToPDF(){


    const title = document.getElementById(
        "scanTitle"
    ).value;



    if(title === ""){


        alert(
            "Bitte zuerst Scan Name eingeben."
        );


        return;

    }



    localStorage.setItem(
        "haldoPDFTitle",
        title
    );



    localStorage.setItem(
        "haldoPDFContent",
        "Gescanntes Dokument: " + title
    );



    document.getElementById(
        "scanMessage"
    ).innerHTML =
    "✅ Scan für PDF vorbereitet";


}