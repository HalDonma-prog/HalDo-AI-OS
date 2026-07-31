*{
box-sizing:border-box;
}


body{

margin:0;
font-family:Arial,sans-serif;
background:#e9eef5;

}



.app{

max-width:600px;
margin:auto;
min-height:100vh;
background:white;
display:flex;
flex-direction:column;

}



header{

background:#1f6feb;
color:white;
text-align:center;
padding:20px;

}



header h1{

margin:0;

}



.page{

padding:20px;
flex:1;

}



.hidden{

display:none;

}



input{

width:100%;
padding:14px;
margin:8px 0;
font-size:16px;
border-radius:8px;
border:1px solid #aaa;

}



button{

padding:12px;
border:0;
border-radius:10px;
cursor:pointer;

}



.page button{

background:#1f6feb;
color:white;

}



.icons{

display:grid;
grid-template-columns:repeat(2,1fr);
gap:15px;
margin-top:20px;

}



.icons button{

height:120px;
background:#f1f1f1;
color:#111;
font-size:35px;

}



.icons span{

display:block;
font-size:16px;

}



.chat{

height:350px;
overflow-y:auto;

}



.message{

padding:12px;
margin:10px 0;
border-radius:12px;

}



.user{

background:#1f6feb;
color:white;
margin-left:40px;

}



.bot{

background:#eeeeee;

}



.input-area{

display:flex;
gap:10px;

}



.input-area input{

flex:1;

}



.input-area button{

width:60px;

}



nav{

display:flex;
justify-content:space-around;
border-top:1px solid #ddd;
padding:10px;

}



nav button{

background:white;
color:#111;
font-size:14px;

}



#usersList{

margin:15px 0;

}



.user-card{

padding:10px;
background:#eeeeee;
border-radius:8px;
margin-bottom:8px;

}