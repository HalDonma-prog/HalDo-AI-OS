// =================================
// HalDo Language Center
// =================================


const languages = [


"🇩🇪 Deutsch",

"🇬🇧 English",

"🇹🇷 Türkçe",

"🟢 Kurdî",

"🟢 Ezdîkî",

"🇸🇦 العربية",

"🇫🇷 Français",

"🇪🇸 Español",

"🇮🇹 Italiano"


];



const box =
document.getElementById(
"languages"
);



languages.forEach(lang=>{


let div =
document.createElement(
"div"
);



div.className="language";


div.innerHTML=

`

<h3>
${lang}
</h3>

<button onclick="selectLanguage('${lang}')">

Auswählen

</button>

`;



box.appendChild(div);


});




function selectLanguage(lang){

localStorage.setItem(
"haldo_language",
lang
);


alert(
"Sprache gewählt: "+lang
);


}




function back(){

window.history.back();

}