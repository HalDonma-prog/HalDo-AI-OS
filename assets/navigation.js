/*
=====================================
🌍 HALDO AI OS PROFESSIONAL 7.1
NAVIGATION SYSTEM
=====================================
*/


"use strict";


console.log(
"🧭 Navigation System geladen"
);





async function loadPage(page){


const content =
document.getElementById(
"content"
);



if(!content){

console.error(
"Content Bereich nicht gefunden"
);

return;

}



try{


const response =
await fetch(
`pages/${page}.html`
);



if(!response.ok){

throw new Error(
"Seite nicht gefunden"
);

}



const html =
await response.text();



content.innerHTML =
html;



console.log(
"✅ Seite geladen:",
page
);



}



catch(error){


content.innerHTML =

`
<section class="welcome-card">

<h2>
❌ Fehler
</h2>

<p>
Die Seite konnte nicht geladen werden.
</p>

</section>
`;



console.error(
error
);


}



}





window.loadPage =
loadPage;