// =================================
// HalDo AI OS 18
// Boot Loader
// =================================


console.log(
"🟡 HalDo AI OS 18 Bootloader gestartet"
);


function updateStatus(text){

const status =
document.getElementById("status");


if(status){

status.innerHTML = text;

}

}



updateStatus(
"🔵 Kernel wird vorbereitet..."
);